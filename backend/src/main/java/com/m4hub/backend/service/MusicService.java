package com.m4hub.backend.service;

import com.m4hub.backend.model.Favorite;
import com.m4hub.backend.model.Song;
import com.m4hub.backend.model.Wishlist;
import com.m4hub.backend.repository.FavoriteRepository;
import com.m4hub.backend.repository.SongRepository;
import com.m4hub.backend.repository.WishlistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.m4hub.backend.util.DataGenerator;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;

@Service
public class MusicService {
    private static final Logger logger = LoggerFactory.getLogger(MusicService.class);

    private final SongRepository songRepository;
    private final FavoriteRepository favoriteRepository;
    private final WishlistRepository wishlistRepository;
    private final RestTemplate restTemplate;
    private final DataGenerator dataGenerator;
    private final ObjectMapper objectMapper;

    @Value("${jamendo.api.client_id:56d30c95}")
    private String clientId;

    public MusicService(SongRepository songRepository,
            FavoriteRepository favoriteRepository,
            WishlistRepository wishlistRepository,
            RestTemplate restTemplate,
            DataGenerator dataGenerator,
            ObjectMapper objectMapper) {
        this.songRepository = songRepository;
        this.favoriteRepository = favoriteRepository;
        this.wishlistRepository = wishlistRepository;
        this.restTemplate = restTemplate;
        this.dataGenerator = dataGenerator;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedSongsFromJson() {
        if (songRepository.count() > 0) {
            logger.info("Songs already exist in database. Skipping JSON seed.");
            return;
        }

        try {
            logger.info("Loading songs from simplified local JSON seed file...");
            ClassPathResource resource = new ClassPathResource("songs.json");
            if (!resource.exists()) {
                logger.warn("songs.json not found in resources. Falling back to mock data.");
                seedMockSongs();
                return;
            }

            InputStream inputStream = resource.getInputStream();
            List<Song> songs = objectMapper.readValue(inputStream, new TypeReference<List<Song>>() {
            });

            logger.info("Found {} songs in JSON file. Saving to database...", songs.size());

            // Deduplicate and save
            int savedCount = 0;
            for (Song song : songs) {
                if (songRepository.findByExternalId(song.getExternalId()).isEmpty()) {
                    // Ensure ID is null so JPA generates a new one
                    song.setId(null);
                    songRepository.save(song);
                    savedCount++;
                }
            }
            logger.info("Successfully seeded {} songs from JSON.", savedCount);

        } catch (Exception e) {
            logger.error("Failed to seed songs from JSON: {}", e.getMessage(), e);
            // Fallback to internal mock
            if (songRepository.count() == 0) {
                seedMockSongs();
            }
        }
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public void syncSongsFromJamendo(int limit) {
        logger.info("Starting sync of {} songs from Jamendo...", limit);

        String url = String.format(
                "https://api.jamendo.com/v3.0/tracks/?client_id=%s&format=json&limit=%d&include=musicinfo",
                clientId, limit);

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

                int savedCount = 0;
                for (Map<String, Object> trackData : results) {
                    String externalId = String.valueOf(trackData.get("id"));

                    if (songRepository.findByExternalId(externalId).isEmpty()) {
                        Song song = new Song();
                        song.setExternalId(externalId);
                        song.setTitle((String) trackData.get("name"));
                        song.setArtist((String) trackData.get("artist_name"));
                        song.setAlbum((String) trackData.get("album_name"));
                        song.setDuration((Integer) trackData.get("duration"));
                        song.setAudioUrl((String) trackData.get("audio"));
                        song.setImageUrl((String) trackData.get("image"));

                        Map<String, Object> musicInfo = (Map<String, Object>) trackData.get("musicinfo");
                        if (musicInfo != null && musicInfo.containsKey("genre")) {
                            song.setGenre((String) musicInfo.get("genre"));
                        }

                        songRepository.save(song);
                        savedCount++;
                    }
                }
                logger.info("Sync complete. Saved {} new songs.", savedCount);
            }
        } catch (Exception e) {
            logger.error("Error during Jamendo sync: {}. Will try local JSON seed.", e.getMessage());
            seedSongsFromJson();
        }

        // Fallback: If still no songs
        if (songRepository.count() == 0) {
            seedSongsFromJson();
        }
    }

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public List<Song> searchSongs(String query) {
        return songRepository.searchSongs(query);
    }

    // Favorite management
    @Transactional
    public void toggleFavorite(Long userId, Long songId) {
        var existing = favoriteRepository.findByUserIdAndSongId(userId, songId);
        if (existing.isPresent()) {
            favoriteRepository.deleteByUserIdAndSongId(userId, songId);
        } else {
            favoriteRepository.save(new Favorite(userId, songId));
        }
    }

    public List<Song> getUserFavorites(Long userId) {
        List<Favorite> favs = favoriteRepository.findByUserId(userId);
        return favs.stream()
                .map(f -> songRepository.findById(f.getSongId()).orElse(null))
                .filter(s -> s != null)
                .toList();
    }

    // Wishlist management
    @Transactional
    public void toggleWishlist(Long userId, Long songId) {
        var existing = wishlistRepository.findByUserIdAndSongId(userId, songId);
        if (existing.isPresent()) {
            wishlistRepository.deleteByUserIdAndSongId(userId, songId);
        } else {
            wishlistRepository.save(new Wishlist(userId, songId));
        }
    }

    public List<Song> getUserWishlist(Long userId) {
        List<Wishlist> wishes = wishlistRepository.findByUserId(userId);
        return wishes.stream()
                .map(w -> songRepository.findById(w.getSongId()).orElse(null))
                .filter(s -> s != null)
                .toList();
    }

    @Transactional
    public void seedMockSongs() {
        logger.info("Clearing old songs to replace with high-quality full tracks...");
        songRepository.deleteAll();
        logger.info("Starting large-scale mock data seeding...");
        dataGenerator.generate500Songs();
        logger.info("Data seeding complete. Current song count: {}", songRepository.count());
    }

    public List<Song> getTrendingSongs() {
        return songRepository.findTopTracks();
    }

    public List<String> getAlbums() {
        return songRepository.findDistinctAlbums();
    }

    public List<String> getArtists() {
        return songRepository.findDistinctArtists();
    }

    public List<Song> getSongsByAlbum(String albumName) {
        return songRepository.findByAlbum(albumName);
    }
}

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

@Service
public class MusicService {
    private static final Logger logger = LoggerFactory.getLogger(MusicService.class);

    private final SongRepository songRepository;
    private final FavoriteRepository favoriteRepository;
    private final WishlistRepository wishlistRepository;
    private final RestTemplate restTemplate;
    private final DataGenerator dataGenerator;

    @Value("${jamendo.api.client_id:56d30c95}")
    private String clientId;

    public MusicService(SongRepository songRepository,
            FavoriteRepository favoriteRepository,
            WishlistRepository wishlistRepository,
            RestTemplate restTemplate,
            DataGenerator dataGenerator) {
        this.songRepository = songRepository;
        this.favoriteRepository = favoriteRepository;
        this.wishlistRepository = wishlistRepository;
        this.restTemplate = restTemplate;
        this.dataGenerator = dataGenerator;
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
            logger.error("Error during Jamendo sync: {}. Will use mock data if needed.", e.getMessage());
        }

        // Fallback: If no songs in DB after sync attempt (API failure or suspension),
        // add mock songs
        if (songRepository.count() == 0) {
            logger.info("Adding mock fallback songs because database is empty...");
            List<Song> mockSongs = new ArrayList<>();
            mockSongs.add(new Song("Stellar Drift", "Solaris", "Space Dreams", 185,
                    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", "Lo-Fi", "mock-1"));
            mockSongs.add(new Song("Neon Nights", "Cyber-A", "Synthwave 2077", 210,
                    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400", "Electronic", "mock-2"));
            mockSongs.add(new Song("Midnight Piano", "Clara Oaks", "Pure Solitude", 145,
                    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                    "https://images.unsplash.com/photo-1520529611442-eabb01c5029c?w=400", "Classical", "mock-3"));

            for (Song mock : mockSongs) {
                if (songRepository.findByExternalId(mock.getExternalId()).isEmpty()) {
                    songRepository.save(mock);
                }
            }
            logger.info("Added 3 fallback mock songs.");
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
}

package com.m4hub.backend.service;

import com.m4hub.backend.model.Playlist;
import com.m4hub.backend.model.Song;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.PlaylistRepository;
import com.m4hub.backend.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    public PlaylistService(PlaylistRepository playlistRepository, SongRepository songRepository) {
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
    }

    public List<Playlist> getUserPlaylists(User user) {
        return playlistRepository.findByOwnerWithTracks(user);
    }

    public Optional<Playlist> getPlaylistById(Long id) {
        return playlistRepository.findById(id);
    }

    @Transactional
    public Playlist createPlaylist(String name, String description, User user) {
        if (playlistRepository.existsByNameAndOwnerId(name, user.getId())) {
            throw new RuntimeException("A playlist with this name already exists");
        }
        Playlist playlist = new Playlist(name, description, user);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist addSongToPlaylist(Long playlistId, Long songId, User user) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this playlist");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        if (!playlist.getTracks().contains(song)) {
            playlist.getTracks().add(song);
        }

        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist removeSongFromPlaylist(Long playlistId, Long songId, User user) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this playlist");
        }

        playlist.getTracks().removeIf(song -> song.getId().equals(songId));
        return playlistRepository.save(playlist);
    }

    @Transactional
    public void deletePlaylist(Long playlistId, User user) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this playlist");
        }

        playlistRepository.delete(playlist);
    }
}

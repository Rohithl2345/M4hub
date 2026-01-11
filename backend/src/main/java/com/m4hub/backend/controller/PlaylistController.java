package com.m4hub.backend.controller;

import com.m4hub.backend.dto.ApiResponse;
import com.m4hub.backend.model.Playlist;
import com.m4hub.backend.model.User;
import com.m4hub.backend.service.AuthService;
import com.m4hub.backend.service.PlaylistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/music/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;
    private final AuthService authService;

    public PlaylistController(PlaylistService playlistService, AuthService authService) {
        this.playlistService = playlistService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Playlist>> getMyPlaylists(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(playlistService.getUserPlaylists(user));
    }

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        User user = authService.getUserFromToken(token);
        if (user == null)
            return ResponseEntity.status(401).build();

        String name = body.getOrDefault("name", "New Playlist");
        String description = body.getOrDefault("description", "");

        return ResponseEntity.ok(playlistService.createPlaylist(name, description, user));
    }

    @PostMapping("/{playlistId}/add/{songId}")
    public ResponseEntity<Playlist> addSong(
            @RequestHeader("Authorization") String token,
            @PathVariable Long playlistId,
            @PathVariable Long songId) {
        User user = authService.getUserFromToken(token);
        if (user == null)
            return ResponseEntity.status(401).build();

        try {
            return ResponseEntity.ok(playlistService.addSongToPlaylist(playlistId, songId, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{playlistId}/remove/{songId}")
    public ResponseEntity<Playlist> removeSong(
            @RequestHeader("Authorization") String token,
            @PathVariable Long playlistId,
            @PathVariable Long songId) {
        User user = authService.getUserFromToken(token);
        if (user == null)
            return ResponseEntity.status(401).build();

        try {
            return ResponseEntity.ok(playlistService.removeSongFromPlaylist(playlistId, songId, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<ApiResponse<String>> deletePlaylist(
            @RequestHeader("Authorization") String token,
            @PathVariable Long playlistId) {
        User user = authService.getUserFromToken(token);
        if (user == null)
            return ResponseEntity.status(401).build();

        try {
            playlistService.deletePlaylist(playlistId, user);
            return ResponseEntity.ok(new ApiResponse<>(true, "Playlist deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
}

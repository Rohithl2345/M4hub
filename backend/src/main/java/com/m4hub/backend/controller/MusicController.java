package com.m4hub.backend.controller;

import com.m4hub.backend.dto.ApiResponse;
import com.m4hub.backend.dto.MusicToggleRequest;
import com.m4hub.backend.model.Song;
import com.m4hub.backend.model.User;
import com.m4hub.backend.service.AuthService;
import com.m4hub.backend.service.MusicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/music")
public class MusicController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(MusicController.class);

    private final MusicService musicService;
    private final AuthService authService;

    public MusicController(MusicService musicService, AuthService authService) {
        this.musicService = musicService;
        this.authService = authService;
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<String>> syncSongs(@RequestParam(defaultValue = "500") int limit) {
        logger.info("Starting music synchronization for limit: {}", limit);
        musicService.syncSongsFromJamendo(limit);
        return ResponseEntity.ok(new ApiResponse<>(true, "Music synchronization started for " + limit + " songs"));
    }

    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<String>> seedMockSongs() {
        musicService.seedMockSongs();
        return ResponseEntity.ok(new ApiResponse<>(true, "Mock songs seeded successfully"));
    }

    @PostMapping("/seed-json")
    public ResponseEntity<ApiResponse<String>> seedJsonSongs() {
        musicService.seedSongsFromJson(true);
        return ResponseEntity.ok(new ApiResponse<>(true, "Songs re-seeded from JSON successfully."));
    }

    @GetMapping("/songs")
    public ResponseEntity<List<Song>> getAllSongs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isEmpty() || authService.getUserFromToken(authHeader) == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(musicService.getAllSongs());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Song>> searchSongs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam String q) {
        if (authHeader == null || authHeader.isEmpty() || authService.getUserFromToken(authHeader) == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(musicService.searchSongs(q));
    }

    @PostMapping("/favorites/toggle")
    public ResponseEntity<ApiResponse<String>> toggleFavorite(
            @RequestHeader("Authorization") String token,
            @RequestBody MusicToggleRequest request) {

        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized"));
        }

        musicService.toggleFavorite(user.getId(), request.getSongId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Favorite toggled successfully"));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Song>> getFavorites(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(musicService.getUserFavorites(user.getId()));
    }

    @PostMapping("/wishlist/toggle")
    public ResponseEntity<ApiResponse<String>> toggleWishlist(
            @RequestHeader("Authorization") String token,
            @RequestBody MusicToggleRequest request) {

        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized"));
        }

        musicService.toggleWishlist(user.getId(), request.getSongId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Wishlist toggled successfully"));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<Song>> getWishlist(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(musicService.getUserWishlist(user.getId()));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Song>> getTrending(@RequestHeader("Authorization") String token) {
        if (authHeaderInvalid(token))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(musicService.getTrendingSongs());
    }

    @GetMapping("/albums")
    public ResponseEntity<List<String>> getAlbums(@RequestHeader("Authorization") String token) {
        if (authHeaderInvalid(token))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(musicService.getAlbums());
    }

    @GetMapping("/artists")
    public ResponseEntity<List<String>> getArtists(@RequestHeader("Authorization") String token) {
        if (authHeaderInvalid(token))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(musicService.getArtists());
    }

    private boolean authHeaderInvalid(String token) {
        return token == null || token.isEmpty() || authService.getUserFromToken(token) == null;
    }

    @GetMapping("/stream/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> streamSong(@PathVariable String filename) {
        try {
            java.nio.file.Path path = java.nio.file.Paths.get("music-library").resolve(filename).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());

            if (resource.exists()) {
                long contentLength = resource.contentLength();
                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType("audio/mpeg"))
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(org.springframework.http.HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

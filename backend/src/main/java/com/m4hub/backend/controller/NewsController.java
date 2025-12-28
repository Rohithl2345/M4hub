package com.m4hub.backend.controller;

import com.m4hub.backend.model.NewsArticle;
import com.m4hub.backend.service.NewsService;
import com.m4hub.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    private final NewsService newsService;
    private final AuthService authService;

    public NewsController(NewsService newsService, AuthService authService) {
        this.newsService = newsService;
        this.authService = authService;
    }

    private void validateUser(String authHeader) {
        if (authHeader == null || authHeader.isEmpty() || authService.getUserFromToken(authHeader) == null) {
            throw new RuntimeException("Unauthorized: Invalid or missing token");
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<List<NewsArticle>> getLatestNews(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateUser(authHeader);
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<NewsArticle>> getNewsByCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String category) {
        validateUser(authHeader);
        return ResponseEntity.ok(newsService.getNewsByCategory(category));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncNews(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateUser(authHeader);
        newsService.syncNews();
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Sync initiated successfully"));
    }
}

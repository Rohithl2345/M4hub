package com.m4hub.backend.controller;

import com.m4hub.backend.model.NewsArticle;
import com.m4hub.backend.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/latest")
    public ResponseEntity<List<NewsArticle>> getLatestNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<NewsArticle>> getNewsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(newsService.getNewsByCategory(category));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncNews() {
        newsService.syncNewsFromExternalSource();
        return ResponseEntity.ok("Sync initiated successfully");
    }
}

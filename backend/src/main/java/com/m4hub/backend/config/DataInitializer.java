package com.m4hub.backend.config;

import com.m4hub.backend.service.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final NewsService newsService;
    private final com.m4hub.backend.service.MusicService musicService;

    public DataInitializer(NewsService newsService, com.m4hub.backend.service.MusicService musicService) {
        this.newsService = newsService;
        this.musicService = musicService;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Starting initial news synchronization...");
            newsService.syncNews();
        } catch (Exception e) {
            logger.error("Failed to perform initial news synchronization: {}", e.getMessage());
        }

        try {
            logger.info("Starting initial music synchronization...");
            // Sync 200 songs for a rich database
            musicService.syncSongsFromJamendo(200);
        } catch (Exception e) {
            logger.error("Failed to perform initial music synchronization: {}", e.getMessage());
        }
    }
}

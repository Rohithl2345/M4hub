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

    public DataInitializer(NewsService newsService) {
        this.newsService = newsService;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Starting initial news synchronization...");
            newsService.syncNews();
        } catch (Exception e) {
            logger.error("Failed to perform initial news synchronization: {}", e.getMessage());
        }
    }
}

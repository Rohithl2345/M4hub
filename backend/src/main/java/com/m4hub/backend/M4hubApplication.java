package com.m4hub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.m4hub.backend.service.NewsService;

@SpringBootApplication
public class M4hubApplication {
    public static void main(String[] args) {
        SpringApplication.run(M4hubApplication.class, args);
    }

    @Bean
    public CommandLineRunner initNews(NewsService newsService) {
        return args -> {
            try {
                newsService.syncNewsFromExternalSource();
            } catch (Exception e) {
                // Ignore startup sync errors, service handles fallbacks
            }
        };
    }
}

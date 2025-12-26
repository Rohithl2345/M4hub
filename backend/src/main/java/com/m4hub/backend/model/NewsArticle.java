package com.m4hub.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;

    private String sourceName;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(columnDefinition = "TEXT")
    private String urlToImage;

    private LocalDateTime publishedAt;

    private String category;

    @Column(unique = true)
    private String externalId;

    public NewsArticle(String title, String description, String author, String sourceName, String url,
            String urlToImage, LocalDateTime publishedAt, String category, String externalId) {
        this.title = title;
        this.description = description;
        this.author = author;
        this.sourceName = sourceName;
        this.url = url;
        this.urlToImage = urlToImage;
        this.publishedAt = publishedAt;
        this.category = category;
        this.externalId = externalId;
    }
}

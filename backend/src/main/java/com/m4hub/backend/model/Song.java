package com.m4hub.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "songs")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    private String album;

    @Column(nullable = false)
    private Integer duration; // in seconds

    @Column(nullable = false, length = 1000)
    @com.fasterxml.jackson.annotation.JsonProperty("audio_url")
    private String audioUrl;

    @Column(length = 1000)
    @com.fasterxml.jackson.annotation.JsonProperty("image_url")
    private String imageUrl;

    private String genre;

    private Integer releaseYear;

    @Column(unique = true)
    @com.fasterxml.jackson.annotation.JsonProperty("external_id")
    private String externalId; // Jamendo track ID

    private Instant createdAt = Instant.now();

    // Constructors
    public Song() {
    }

    public Song(String title, String artist, String album, Integer duration, String audioUrl, String imageUrl,
            String genre, String externalId) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
        this.genre = genre;
        this.externalId = externalId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

package com.m4hub.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tab_usage")
public class TabUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tabName;

    @Column(nullable = false)
    private Long durationSeconds;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public TabUsage() {
    }

    public TabUsage(User user, String tabName, Long durationSeconds) {
        this.user = user;
        this.tabName = tabName;
        this.durationSeconds = durationSeconds;
        this.timestamp = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTabName() {
        return tabName;
    }

    public void setTabName(String tabName) {
        this.tabName = tabName;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

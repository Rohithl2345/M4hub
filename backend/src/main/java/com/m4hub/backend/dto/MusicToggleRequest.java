package com.m4hub.backend.dto;

public class MusicToggleRequest {
    private Long songId;

    public MusicToggleRequest() {}

    public MusicToggleRequest(Long songId) {
        this.songId = songId;
    }

    public Long getSongId() {
        return songId;
    }

    public void setSongId(Long songId) {
        this.songId = songId;
    }
}

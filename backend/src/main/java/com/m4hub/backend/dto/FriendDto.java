package com.m4hub.backend.dto;

import java.time.Instant;

public class FriendDto extends UserDto {
    private String lastMessageContent;
    private Instant lastMessageAt;

    public FriendDto(Long id, String phoneNumber, String email, String username, String name, String firstName,
            String lastName, String dateOfBirth, String gender, Boolean isVerified, Boolean isActive) {
        super(id, phoneNumber, email, username, name, firstName, lastName, dateOfBirth, gender, isVerified, isActive);
    }

    public String getLastMessageContent() {
        return lastMessageContent;
    }

    public void setLastMessageContent(String lastMessageContent) {
        this.lastMessageContent = lastMessageContent;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
}

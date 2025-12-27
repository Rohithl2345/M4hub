package com.m4hub.backend.dto;

import java.time.Instant;

public class FriendDto extends UserDto {
    private String lastMessageContent;
    private Instant lastMessageAt;

    public FriendDto(Long id, String phoneNumber, String email, String username, String name, String firstName,
            String lastName, String dateOfBirth, String gender, Boolean isVerified, Boolean isActive,
            Boolean hasSeenTutorial) {
        super(id, phoneNumber, email, username, name, firstName, lastName, dateOfBirth, gender, isVerified, isActive,
                hasSeenTutorial);
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

    public static FriendDto fromEntity(com.m4hub.backend.model.User user) {
        if (user == null)
            return null;
        return new FriendDto(
                user.getId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getGender(),
                user.getIsVerified(),
                user.getIsActive(),
                user.getHasSeenTutorial());
    }
}

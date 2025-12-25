package com.m4hub.backend.dto;

import com.m4hub.backend.model.GroupChat;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public class GroupChatDto {
    private Long id;
    private String name;
    private String description;
    private UserDto createdBy;
    private List<UserDto> members;
    private String avatarUrl;
    private Instant createdAt;
    private Instant lastMessageAt;

    public GroupChatDto(GroupChat group) {
        this.id = group.getId();
        this.name = group.getName();
        this.description = group.getDescription();
        this.avatarUrl = group.getAvatarUrl();
        this.createdAt = group.getCreatedAt();
        this.lastMessageAt = group.getLastMessageAt();

        if (group.getCreatedBy() != null) {
            this.createdBy = UserDto.fromEntity(group.getCreatedBy());
        }

        if (group.getMembers() != null) {
            this.members = group.getMembers().stream()
                    .map(UserDto::fromEntity)
                    .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserDto getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserDto createdBy) {
        this.createdBy = createdBy;
    }

    public List<UserDto> getMembers() {
        return members;
    }

    public void setMembers(List<UserDto> members) {
        this.members = members;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
}

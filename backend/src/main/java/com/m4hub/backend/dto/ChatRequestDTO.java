package com.m4hub.backend.dto;

public class ChatRequestDTO {
    private String receiverUsername;

    public ChatRequestDTO() {
    }

    public String getReceiverUsername() {
        return receiverUsername;
    }

    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }
}

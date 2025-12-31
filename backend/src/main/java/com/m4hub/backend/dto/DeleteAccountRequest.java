package com.m4hub.backend.dto;

public class DeleteAccountRequest {
    private String type; // "pause" or "delete"
    private Integer days; // 30, 60, 90 (only for type="pause")

    public DeleteAccountRequest() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }
}

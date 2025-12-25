package com.m4hub.backend.dto;

public class SendEmailOtpRequest {
    private String email;
    private String password;

    public SendEmailOtpRequest() {
    }

    public SendEmailOtpRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

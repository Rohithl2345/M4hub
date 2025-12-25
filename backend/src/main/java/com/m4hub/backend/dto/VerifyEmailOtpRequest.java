package com.m4hub.backend.dto;

public class VerifyEmailOtpRequest {
    private String email;
    private String password;
    private String otpCode;

    public VerifyEmailOtpRequest() {
    }

    public VerifyEmailOtpRequest(String email, String password, String otpCode) {
        this.email = email;
        this.password = password;
        this.otpCode = otpCode;
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

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }
}

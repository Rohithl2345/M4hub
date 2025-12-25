package com.m4hub.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_otp_verifications")
public class EmailOtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String otpCode;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public EmailOtpVerification() {
        this.createdAt = Instant.now();
    }

    public EmailOtpVerification(String email, String otpCode, String passwordHash, Instant expiresAt) {
        this.email = email;
        this.otpCode = otpCode;
        this.passwordHash = passwordHash;
        this.expiresAt = expiresAt;
        this.isUsed = false;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsUsed() {
        return isUsed;
    }

    public void setIsUsed(Boolean isUsed) {
        this.isUsed = isUsed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

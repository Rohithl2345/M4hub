package com.m4hub.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * JWT Token utility for generating and validating JSON Web Tokens
 */
@Component
public class JwtTokenUtil {

    @Value("${jwt.secret:m4hub-super-secret-key-change-this-in-production-minimum-256-bits}")
    private String secret;

    @Value("${jwt.expiration-days:7}")
    private long expirationDays;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JwtTokenUtil.class);

    /**
     * Generate JWT token for a user
     * 
     * @param userId   User's unique identifier
     * @param email    User's email
     * @param username User's username (optional)
     * @return JWT token string
     */
    public String generateToken(Long userId, String email, String username) {
        Instant now = Instant.now();
        Instant expiration = now.plus(expirationDays, ChronoUnit.DAYS);

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        var builder = Jwts.builder()
                .claim("userId", userId)
                .claim("email", email)
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(key);

        if (username != null) {
            builder.claim("username", username);
        }

        return builder.compact();
    }

    /**
     * Generate a refresh token (longer expiration)
     * 
     * @param userId User's unique identifier
     * @param email  User's email
     * @return Refresh token string
     */
    public String generateRefreshToken(Long userId, String email) {
        Instant now = Instant.now();
        Instant expiration = now.plus(30, ChronoUnit.DAYS);

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .claim("userId", userId)
                .claim("email", email)
                .claim("tokenType", "refresh")
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(key)
                .compact();
    }

    /**
     * Validate and parse JWT token
     * 
     * @param token JWT token string
     * @return Claims if valid, null if invalid
     */
    public Claims validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract user ID from token
     * 
     * @param token JWT token string
     * @return User ID or null if invalid
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        if (claims != null) {
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Integer) {
                return ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                return (Long) userIdObj;
            }
        }
        return null;
    }

    /**
     * Extract email from token
     * 
     * @param token JWT token string
     * @return Email or null if invalid
     */
    public String getEmailFromToken(String token) {
        Claims claims = validateToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token string
     * @return true if expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        Claims claims = validateToken(token);
        if (claims == null) {
            return true;
        }
        return claims.getExpiration().before(new Date());
    }

    /**
     * Check if token is a refresh token
     * 
     * @param token JWT token string
     * @return true if it's a refresh token
     */
    public boolean isRefreshToken(String token) {
        Claims claims = validateToken(token);
        if (claims == null) {
            return false;
        }
        Object tokenType = claims.get("tokenType");
        return "refresh".equals(tokenType);
    }
}

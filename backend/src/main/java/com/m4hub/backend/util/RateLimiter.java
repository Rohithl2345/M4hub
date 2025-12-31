package com.m4hub.backend.util;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiter utility using Guava's LoadingCache
 * Prevents brute force attacks and API abuse
 */
@Component
public class RateLimiter {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RateLimiter.class);

    // Login attempts: 5 per 15 minutes
    private final LoadingCache<String, AtomicInteger> loginAttempts = CacheBuilder.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(15))
            .build(new CacheLoader<String, AtomicInteger>() {
                @Override
                public AtomicInteger load(String key) {
                    return new AtomicInteger(0);
                }
            });

    // OTP requests: 3 per 15 minutes
    private final LoadingCache<String, AtomicInteger> otpRequests = CacheBuilder.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(15))
            .build(new CacheLoader<String, AtomicInteger>() {
                @Override
                public AtomicInteger load(String key) {
                    return new AtomicInteger(0);
                }
            });

    /**
     * Check if login is allowed for an identifier
     * 
     * @param identifier Email or username
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean allowLogin(String identifier) {
        try {
            AtomicInteger attempts = loginAttempts.get(identifier.toLowerCase());
            int count = attempts.incrementAndGet();

            if (count > 5) {
                logger.warn("Login rate limit exceeded for: {}", identifier);
                return false;
            }

            logger.debug("Login attempt {}/5 for: {}", count, identifier);
            return true;
        } catch (ExecutionException e) {
            logger.error("Error checking login rate limit", e);
            return true; // Fail open
        }
    }

    /**
     * Reset login attempts for an identifier (e.g., after successful login)
     * 
     * @param identifier Email or username
     */
    public void resetLoginAttempts(String identifier) {
        loginAttempts.invalidate(identifier.toLowerCase());
        logger.debug("Reset login attempts for: {}", identifier);
    }

    /**
     * Check if OTP request is allowed for an identifier
     * 
     * @param identifier Email or phone number
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean allowOtpRequest(String identifier) {
        try {
            AtomicInteger requests = otpRequests.get(identifier.toLowerCase());
            int count = requests.incrementAndGet();

            if (count > 3) {
                logger.warn("OTP request rate limit exceeded for: {}", identifier);
                return false;
            }

            logger.debug("OTP request {}/3 for: {}", count, identifier);
            return true;
        } catch (ExecutionException e) {
            logger.error("Error checking OTP rate limit", e);
            return true; // Fail open
        }
    }

    /**
     * Get remaining login attempts
     * 
     * @param identifier Email or username
     * @return Number of attempts remaining
     */
    public int getRemainingLoginAttempts(String identifier) {
        try {
            AtomicInteger attempts = loginAttempts.get(identifier.toLowerCase());
            return Math.max(0, 5 - attempts.get());
        } catch (ExecutionException e) {
            return 5;
        }
    }

    /**
     * Get remaining OTP requests
     * 
     * @param identifier Email or phone number
     * @return Number of OTP requests remaining
     */
    public int getRemainingOtpRequests(String identifier) {
        try {
            AtomicInteger requests = otpRequests.get(identifier.toLowerCase());
            return Math.max(0, 3 - requests.get());
        } catch (ExecutionException e) {
            return 3;
        }
    }
}

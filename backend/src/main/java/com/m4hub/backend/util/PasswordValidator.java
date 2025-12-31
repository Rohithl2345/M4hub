package com.m4hub.backend.util;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Password validation utility
 * Enforces strong password requirements across the application
 */
@Component
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");

    /**
     * Validates password against all security requirements
     * 
     * @param password The password to validate
     * @return ValidationResult with success status and error message if invalid
     */
    public ValidationResult validate(String password) {
        if (password == null || password.isEmpty()) {
            return new ValidationResult(false, "Password is required");
        }

        if (password.length() < MIN_LENGTH) {
            return new ValidationResult(false,
                    String.format("Password must be at least %d characters long", MIN_LENGTH));
        }

        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            return new ValidationResult(false,
                    "Password must contain at least one uppercase letter");
        }

        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            return new ValidationResult(false,
                    "Password must contain at least one lowercase letter");
        }

        if (!DIGIT_PATTERN.matcher(password).find()) {
            return new ValidationResult(false,
                    "Password must contain at least one number");
        }

        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            return new ValidationResult(false,
                    "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
        }

        return new ValidationResult(true, null);
    }

    /**
     * Result of password validation
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String message;

        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }
    }
}

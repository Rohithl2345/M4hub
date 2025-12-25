package com.m4hub.backend.service;

import com.m4hub.backend.dto.*;
import com.m4hub.backend.model.EmailOtpVerification;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.EmailOtpVerificationRepository;
import com.m4hub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final EmailOtpVerificationRepository emailOtpRepository;
    private final EmailService emailService;

    /**
     * Handle forgot password: verify email, update password hash
     */
    @Transactional
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (email == null || email.isEmpty()) {
            return new AuthResponse(false, "Email is required");
        }
        email = email.toLowerCase().trim();
        if (newPassword == null || newPassword.length() < 6) {
            return new AuthResponse(false, "Password must be at least 6 characters");
        }
        if (!newPassword.equals(confirmPassword)) {
            return new AuthResponse(false, "Passwords do not match");
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();
        String passwordHash = hashPassword(newPassword);
        user.setPasswordHash(passwordHash);
        userRepository.save(user);

        return new AuthResponse(true, "Password reset successful");
    }

    // In-memory token storage (token -> identifier)
    private final Map<String, String> tokenStorage = new ConcurrentHashMap<>();

    // In-memory OTP resend tracking (email -> ResendInfo)
    private final Map<String, ResendInfo> resendTracking = new ConcurrentHashMap<>();

    // Inner class to track resend attempts
    private static class ResendInfo {
        int attempts;
        Instant firstAttemptTime;

        ResendInfo() {
            this.attempts = 1;
            this.firstAttemptTime = Instant.now();
        }
    }

    public AuthService(UserRepository userRepository,
            EmailOtpVerificationRepository emailOtpRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
    }

    /**
     * Simple password hashing using SHA-256
     * In production, use BCrypt from Spring Security
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP to email for registration/login
     */
    @Transactional
    public AuthResponse sendEmailOtp(SendEmailOtpRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        if (email != null) {
            email = email.toLowerCase().trim();
        }

        // Validate email format
        if (email == null || email.isEmpty() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return new AuthResponse(false, "Invalid email format");
        }

        // Validate password complexity
        if (password == null || password.length() < 8) {
            return new AuthResponse(false, "Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            return new AuthResponse(false, "Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            return new AuthResponse(false, "Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return new AuthResponse(false, "Password must contain at least one special character");
        }

        // Check if user already exists with this email
        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent() && existingUser.get().getIsVerified()) {
            return new AuthResponse(false, "Email already registered. Please login instead.");
        }

        // Generate 6-digit OTP
        String otpCode = generateOtp();

        // Hash the password
        String passwordHash = hashPassword(password);

        // Set expiry time (5 minutes from now)
        Instant expiresAt = Instant.now().plus(5, ChronoUnit.MINUTES);

        // Delete any existing OTPs for this email (flush to ensure it's committed)
        emailOtpRepository.deleteByEmail(email);
        emailOtpRepository.flush();

        // Save new OTP
        EmailOtpVerification emailOtp = new EmailOtpVerification(email, otpCode, passwordHash, expiresAt);
        emailOtpRepository.save(emailOtp);
        emailOtpRepository.flush();

        // Log OTP prominently for development
        logger.info("╔════════════════════════════════════════════════════════════╗");
        logger.info("║                    🔐 EMAIL OTP GENERATED                  ║");
        logger.info("╠════════════════════════════════════════════════════════════╣");
        logger.info("║  Email: {}", String.format("%-45s", email) + "║");
        logger.info("║  OTP Code: {}", String.format("%-42s", otpCode) + "║");
        logger.info("║  Expires: 5 minutes                                        ║");
        logger.info("╚════════════════════════════════════════════════════════════╝");

        // ALWAYS print to System.out for visibility in terminal
        System.out.println("\n" + "=".repeat(70));
        System.out.println("🔐 EMAIL OTP GENERATED - TERMINAL OUTPUT");
        System.out.println("=".repeat(70));
        System.out.println("Email:     " + email);
        System.out.println("OTP Code:  " + otpCode);
        System.out.println("Expires:   5 minutes");
        System.out.println("=".repeat(70) + "\n");

        // Send OTP via email
        emailService.sendOtp(email, otpCode);

        return new AuthResponse(true, "OTP sent successfully to " + email);
    }

    /**
     * Resend OTP to email with rate limiting
     * Max 3 resends per 15 minutes
     */
    @Transactional
    public AuthResponse resendEmailOtp(SendEmailOtpRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        if (email != null) {
            email = email.toLowerCase().trim();
        }

        // Validate email format
        if (email == null || email.isEmpty() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return new AuthResponse(false, "Invalid email format");
        }

        // Validate password complexity
        if (password == null || password.length() < 8) {
            return new AuthResponse(false, "Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            return new AuthResponse(false, "Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            return new AuthResponse(false, "Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return new AuthResponse(false, "Password must contain at least one special character");
        }

        // Check rate limiting
        ResendInfo resendInfo = resendTracking.get(email);
        Instant now = Instant.now();

        if (resendInfo != null) {
            // Check if 15 minutes have passed since first attempt
            long minutesSinceFirst = ChronoUnit.MINUTES.between(resendInfo.firstAttemptTime, now);

            if (minutesSinceFirst < 15) {
                // Still within the 15-minute window
                if (resendInfo.attempts >= 3) {
                    long minutesRemaining = 15 - minutesSinceFirst;
                    return new AuthResponse(false,
                            "Too many resend attempts. Please wait " + minutesRemaining
                                    + " minutes before trying again.");
                }
                // Increment attempts
                resendInfo.attempts++;
            } else {
                // 15 minutes have passed, reset the counter
                resendTracking.remove(email);
                resendTracking.put(email, new ResendInfo());
            }
        } else {
            // First resend attempt
            resendTracking.put(email, new ResendInfo());
        }

        // Generate new OTP
        String otpCode = generateOtp();

        // Hash the password
        String passwordHash = hashPassword(password);

        // Set expiry time (5 minutes from now)
        Instant expiresAt = Instant.now().plus(5, ChronoUnit.MINUTES);

        // Delete any existing OTPs for this email
        emailOtpRepository.deleteByEmail(email);
        emailOtpRepository.flush();

        // Save new OTP
        EmailOtpVerification emailOtp = new EmailOtpVerification(email, otpCode, passwordHash, expiresAt);
        emailOtpRepository.save(emailOtp);
        emailOtpRepository.flush();

        // Log OTP prominently for development
        logger.info("╔════════════════════════════════════════════════════════════╗");
        logger.info("║                 🔄 EMAIL OTP RESENT                        ║");
        logger.info("╠════════════════════════════════════════════════════════════╣");
        logger.info("║  Email: {}", String.format("%-45s", email) + "║");
        logger.info("║  OTP Code: {}", String.format("%-42s", otpCode) + "║");
        logger.info("║  Expires: 5 minutes                                        ║");
        logger.info("╚════════════════════════════════════════════════════════════╝");

        // ALWAYS print to System.out for visibility in terminal
        System.out.println("\n" + "=".repeat(70));
        System.out.println("🔄 EMAIL OTP RESENT - TERMINAL OUTPUT");
        System.out.println("=".repeat(70));
        System.out.println("Email:     " + email);
        System.out.println("OTP Code:  " + otpCode);
        System.out.println("Expires:   5 minutes");
        System.out.println("=".repeat(70) + "\n");

        // Send OTP via email
        emailService.sendOtp(email, otpCode);

        return new AuthResponse(true, "OTP resent successfully to " + email);
    }

    /**
     * Attempt direct email/password login (no OTP). Returns success if user exists
     * and password matches.
     */
    @Transactional
    public AuthResponse loginWithEmail(LoginRequest request) {
        String identifier = request.getEmail();
        String password = request.getPassword();

        if (identifier == null || identifier.isEmpty()) {
            return new AuthResponse(false, "Email or Username is required");
        }
        identifier = identifier.trim();

        if (password == null || password.length() < 6) {
            logger.warn("Login failed: Password too short for identifier: {}", identifier);
            return new AuthResponse(false, "Password must be at least 6 characters");
        }

        Optional<User> userOpt;
        if (identifier.contains("@")) {
            logger.info("Login attempt for email: {}", identifier);
            userOpt = userRepository.findByEmail(identifier.toLowerCase());
        } else {
            logger.info("Login attempt for username: {}", identifier);
            userOpt = userRepository.findByUsername(identifier.toLowerCase());
        }

        if (userOpt.isEmpty()) {
            logger.warn("Login failed: User not found for identifier: {}", identifier);
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();
        String storedHash = user.getPasswordHash();
        if (storedHash == null) {
            return new AuthResponse(false,
                    "No password set for this account. Please use OTP to register or set a password.");
        }

        String passwordHash = hashPassword(password);
        if (!passwordHash.equals(storedHash)) {
            return new AuthResponse(false, "Invalid credentials");
        }

        // Update last login
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // Generate auth token
        String token = UUID.randomUUID().toString();
        // Persist token to database instead of memory
        user.setSessionToken(token);
        userRepository.save(user);

        UserDto userDto = new UserDto(
                user.getId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getGender(),
                user.getIsVerified(),
                user.getIsActive());

        return new AuthResponse(true, "Login successful", token, userDto);
    }

    /**
     * Verify email OTP and create/login user
     */
    @Transactional
    public AuthResponse verifyEmailOtp(VerifyEmailOtpRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String otpCode = request.getOtpCode();

        final String normalizedEmail = (email != null) ? email.toLowerCase().trim() : null;

        // Validate inputs
        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            return new AuthResponse(false, "Email is required");
        }
        if (password == null || password.isEmpty()) {
            return new AuthResponse(false, "Password is required");
        }
        if (otpCode == null || otpCode.isEmpty()) {
            return new AuthResponse(false, "OTP code is required");
        }

        // Find valid OTP - get the most recent one if multiple exist
        var otpList = emailOtpRepository.findByEmailAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(
                normalizedEmail, otpCode, Instant.now());

        if (otpList.isEmpty()) {
            return new AuthResponse(false, "Invalid or expired OTP");
        }

        // Get the most recent OTP record (in case of duplicates)
        EmailOtpVerification emailOtp = otpList.stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .orElse(otpList.get(0));

        // Mark all matching OTPs as used to prevent reuse
        otpList.forEach(otp -> {
            otp.setIsUsed(true);
            emailOtpRepository.save(otp);
        });

        // Verify password matches
        String passwordHash = hashPassword(password);
        if (!passwordHash.equals(emailOtp.getPasswordHash())) {
            return new AuthResponse(false, "Invalid password");
        }

        // Mark OTP as used
        emailOtp.setIsUsed(true);
        emailOtpRepository.save(emailOtp);

        // Find or create user
        logger.info("Verifying OTP for email: {}. Attempting to find/create user.", normalizedEmail);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    logger.info("User not found for email: {}. Creating new user.", normalizedEmail);
                    User newUser = new User();
                    newUser.setEmail(normalizedEmail);
                    newUser.setPhoneNumber(null); // Null phone number for email users
                    newUser.setIsVerified(true);
                    // Persist provided password hash for future direct logins
                    newUser.setPasswordHash(passwordHash);
                    User savedUser = userRepository.save(newUser);
                    logger.info("New user saved with ID: {}", savedUser.getId());
                    return savedUser;
                });

        // If user exists but has no password set, set it now (user registered via OTP)
        if (user.getPasswordHash() == null) {
            user.setPasswordHash(passwordHash);
        }

        // Update last login
        user.setLastLoginAt(Instant.now());
        user.setIsVerified(true);
        user.setEmail(normalizedEmail);
        userRepository.save(user);

        // Generate auth token
        String token = UUID.randomUUID().toString();
        user.setSessionToken(token);

        // Save user with new token
        userRepository.save(user);

        // Store token -> email mapping (Removed in favor of DB)
        // tokenStorage.put(token, normalizedEmail);

        // Create user DTO
        UserDto userDto = new UserDto(
                user.getId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getGender(),
                user.getIsVerified(),
                user.getIsActive());

        return new AuthResponse(true, "Login successful", token, userDto);
    }

    /**
     * Get phone number from token
     */
    public String getPhoneNumberFromToken(String token) {
        return tokenStorage.get(token);
    }

    /**
     * Get email from token (supports both phone and email authentication)
     */
    public String getEmailFromToken(String token) {
        String identifier = tokenStorage.get(token);
        // If identifier contains @, it's an email, otherwise it's a phone number
        if (identifier != null && identifier.contains("@")) {
            return identifier;
        }
        return null;
    }

    /**
     * Get user identifier from token (phone or email)
     */
    public String getIdentifierFromToken(String token) {
        return tokenStorage.get(token);
    }

    /**
     * Get User entity from token
     */
    /**
     * Get User entity from token (Database backed)
     * Handles Bearer prefix case-insensitively and trims whitespace.
     */
    public User getUserFromToken(String token) {
        if (token == null || token.isEmpty())
            return null;

        String resolvedToken = token;
        if (token.toLowerCase().startsWith("bearer ")) {
            resolvedToken = token.substring(7).trim();
        }

        if (resolvedToken.isEmpty() || resolvedToken.equals("null") || resolvedToken.equals("undefined")) {
            return null;
        }

        return userRepository.findBySessionToken(resolvedToken).orElse(null);
    }
}

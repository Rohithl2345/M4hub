package com.m4hub.backend.service;

import com.m4hub.backend.dto.*;
import com.m4hub.backend.model.EmailOtpVerification;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.EmailOtpVerificationRepository;
import com.m4hub.backend.repository.UserRepository;
import com.m4hub.backend.util.JwtTokenUtil;
import com.m4hub.backend.util.PasswordValidator;
import com.m4hub.backend.util.RateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final EmailOtpVerificationRepository emailOtpRepository;
    private final EmailService emailService;
    private final PasswordValidator passwordValidator;
    private final JwtTokenUtil jwtTokenUtil;
    private final RateLimiter rateLimiter;
    private final PasswordEncoder passwordEncoder; // BCrypt

    @Autowired
    public AuthService(
            UserRepository userRepository,
            EmailOtpVerificationRepository emailOtpRepository,
            EmailService emailService,
            PasswordValidator passwordValidator,
            JwtTokenUtil jwtTokenUtil,
            RateLimiter rateLimiter,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
        this.passwordValidator = passwordValidator;
        this.jwtTokenUtil = jwtTokenUtil;
        this.rateLimiter = rateLimiter;
        this.passwordEncoder = passwordEncoder;
    }

    // ============================================================================
    // PASSWORD UTILITIES (BCrypt)
    // ============================================================================

    private String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // ============================================================================
    // LOGIN WITH EMAIL/PASSWORD (Direct auth, no OTP)
    // ============================================================================

    @Transactional
    public AuthResponse loginWithEmail(LoginRequest request) {
        String identifier = request.getEmail();
        String password = request.getPassword();

        if (identifier == null || identifier.isEmpty()) {
            return new AuthResponse(false, "Email or Username is required");
        }
        identifier = identifier.trim();

        // Rate limiting
        if (!rateLimiter.allowLogin(identifier)) {
            int remaining = rateLimiter.getRemainingLoginAttempts(identifier);
            return new AuthResponse(false,
                    "Too many login attempts. You have " + remaining
                            + " attempts remaining. Please try again in 15 minutes.");
        }

        if (password == null || password.isEmpty()) {
            return new AuthResponse(false, "Password is required");
        }

        // Find user
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
            return new AuthResponse(false, "Invalid email/username or password");
        }

        User user = userOpt.get();

        // Check if account is deleted
        if (user.getIsDeleted()) {
            logger.warn("Login failed: Account is deleted for: {}", identifier);
            return new AuthResponse(false, "This account has been permanently deleted.");
        }

        // Check if account is temporarily deactivated (paused)
        if (!user.getIsActive() && user.getDeactivatedUntil() != null) {
            if (user.getDeactivatedUntil().isAfter(Instant.now())) {
                logger.warn("Login failed: Account is temporarily deactivated for: {}", identifier);
                return new AuthResponse(false,
                        "This account is temporarily deactivated until " + user.getDeactivatedUntil().toString()
                                + ". You can login after this date.");
            } else {
                // Reactivate account if the deactivation period has passed
                logger.info("Reactivating account for: {} as deactivation period has passed", identifier);
                user.setIsActive(true);
                user.setDeactivatedUntil(null);
                userRepository.save(user);
            }
        } else if (!user.getIsActive()) {
            logger.warn("Login failed: Account is inactive for: {}", identifier);
            return new AuthResponse(false, "This account is inactive. Please contact support.");
        }

        String storedHash = user.getPasswordHash();

        if (storedHash == null) {
            return new AuthResponse(false,
                    "No password set. Please use OTP registration.");
        }

        // Verify password (BCrypt or legacy SHA-256)
        boolean passwordMatch = false;
        if (storedHash.startsWith("$2")) {
            // BCrypt hash
            passwordMatch = verifyPassword(password, storedHash);
        } else {
            // Legacy SHA-256 hash - migrate to BCrypt
            logger.info("Migrating legacy password hash to BCrypt for: {}", identifier);
            // For migration, we'd need to verify the old hash first, then re-hash
            // For now, treat as invalid and require password reset
            return new AuthResponse(false,
                    "Please reset your password. Use 'Forgot Password' feature.");
        }

        if (!passwordMatch) {
            logger.warn("Login failed: Invalid password for: {}", identifier);
            return new AuthResponse(false, "Invalid email/username or password");
        }

        // Reset rate limiter on successful login
        rateLimiter.resetLoginAttempts(identifier);

        // Generate JWT tokens
        try {
            String accessToken = jwtTokenUtil.generateToken(user.getId(), user.getEmail(), user.getUsername());
            String refreshToken = jwtTokenUtil.generateRefreshToken(user.getId(), user.getEmail());

            if (accessToken == null || refreshToken == null) {
                logger.error("Failed to generate tokens for user: {}", identifier);
                return new AuthResponse(false, "Failed to generate authentication tokens. Please try again.");
            }

            // Update user record
            user.setSessionToken(accessToken);
            user.setRefreshToken(refreshToken);
            user.setSessionTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
            user.setRefreshTokenExpiry(Instant.now().plus(30, ChronoUnit.DAYS));
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);

            logger.info("Login successful for: {}", identifier);
            UserDto userDto = UserDto.fromEntity(user);

            if (userDto == null) {
                logger.error("Failed to create UserDto for user: {}", identifier);
                return new AuthResponse(false, "Failed to process user data. Please try again.");
            }

            return new AuthResponse(true, "Login successful", accessToken, refreshToken, userDto);
        } catch (Exception e) {
            logger.error("Error generating tokens or creating user DTO for: {}", identifier, e);
            return new AuthResponse(false, "An error occurred during login. Please try again.");
        }
    }

    // ============================================================================
    // SEND EMAIL OTP
    // ============================================================================

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

        // Rate limiting for OTP requests
        if (!rateLimiter.allowOtpRequest(email)) {
            return new AuthResponse(false,
                    "Too many OTP requests. Please try again in 15 minutes.");
        }

        // Validate password using PasswordValidator
        PasswordValidator.ValidationResult validation = passwordValidator.validate(password);
        if (!validation.isValid()) {
            return new AuthResponse(false, validation.getMessage());
        }

        // Check if user already verified
        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent() && existingUser.get().getIsVerified()) {
            return new AuthResponse(false, "Email already registered. Please try with a different email.");
        }

        // Generate OTP
        String otpCode = generateOtp();
        String passwordHash = hashPassword(password);
        Instant expiresAt = Instant.now().plus(5, ChronoUnit.MINUTES);

        // Delete old OTPs
        emailOtpRepository.deleteByEmail(email);

        // Save new OTP
        EmailOtpVerification emailOtp = new EmailOtpVerification(email, otpCode, passwordHash, expiresAt);
        emailOtpRepository.save(emailOtp);

        // Log OTP for development
        String otpLog = "\n" +
                "╔════════════════════════════════════════════════════════════╗\n" +
                "║                    🔐 EMAIL OTP GENERATED                  ║\n" +
                "╠════════════════════════════════════════════════════════════╣\n" +
                "║  Email: " + String.format("%-45s", email) + "║\n" +
                "║  OTP Code: " + String.format("%-42s", otpCode) + "║\n" +
                "║  Expires: 5 minutes                                        ║\n" +
                "╚════════════════════════════════════════════════════════════╝\n";

        logger.info(otpLog);
        System.out.println(otpLog);

        // Send email
        emailService.sendOtp(email, otpCode);

        return new AuthResponse(true, "OTP sent successfully to " + email);
    }

    // ============================================================================
    // RESEND EMAIL OTP
    // ============================================================================

    @Transactional
    public AuthResponse resendEmailOtp(SendEmailOtpRequest request) {
        // Similar to sendEmailOtp but with rate limiting already handled by RateLimiter
        return sendEmailOtp(request);
    }

    // ============================================================================
    // VERIFY EMAIL OTP
    // ============================================================================

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

        // Find valid OTP
        var otpList = emailOtpRepository.findByEmailAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(
                normalizedEmail, otpCode, Instant.now());

        if (otpList.isEmpty()) {
            return new AuthResponse(false, "Invalid or expired OTP");
        }

        // Get most recent OTP
        EmailOtpVerification emailOtp = otpList.stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .orElse(otpList.get(0));

        // Mark all matching OTPs as used
        otpList.forEach(otp -> {
            otp.setIsUsed(true);
            emailOtpRepository.save(otp);
        });

        // Verify password (BCrypt)
        if (!verifyPassword(password, emailOtp.getPasswordHash())) {
            logger.warn("Verification failed: Password mismatch for email: {}", normalizedEmail);
            return new AuthResponse(false, "Invalid password");
        }

        // Find or create user
        logger.info("Verification success for {}. Proceeding to find/create user.", normalizedEmail);
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            logger.info("User not found for email: {}. Creating new record.", normalizedEmail);
            user = new User();
            user.setEmail(normalizedEmail);
            user.setIsVerified(true);
            user.setPasswordHash(emailOtp.getPasswordHash());
            user.setRegistrationSource(request.getRegistrationSource());
            user = userRepository.save(user);
        } else {
            logger.info("User already exists for email: {}. Updating verification status.", normalizedEmail);
            user.setIsVerified(true);
            if (user.getPasswordHash() == null) {
                user.setPasswordHash(emailOtp.getPasswordHash());
            }
            if (user.getRegistrationSource() == null) {
                user.setRegistrationSource(request.getRegistrationSource());
            }
        }

        // Generate JWT tokens
        String accessToken = jwtTokenUtil.generateToken(user.getId(), user.getEmail(), user.getUsername());
        String refreshToken = jwtTokenUtil.generateRefreshToken(user.getId(), user.getEmail());

        // Update user session
        user.setSessionToken(accessToken);
        user.setRefreshToken(refreshToken);
        user.setSessionTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        user.setRefreshTokenExpiry(Instant.now().plus(30, ChronoUnit.DAYS));
        user.setLastLoginAt(Instant.now());

        User savedUser = userRepository.save(user);
        logger.info("User session established for: {}", normalizedEmail);

        UserDto userDto = UserDto.fromEntity(savedUser);
        return new AuthResponse(true, "Login successful", accessToken, refreshToken, userDto);
    }

    // ============================================================================
    // FORGOT PASSWORD
    // ============================================================================

    @Transactional
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (email == null || email.isEmpty()) {
            return new AuthResponse(false, "Email or Username is required");
        }
        String identifier = email.toLowerCase().trim();

        // Validate password using PasswordValidator
        PasswordValidator.ValidationResult validation = passwordValidator.validate(newPassword);
        if (!validation.isValid()) {
            return new AuthResponse(false, validation.getMessage());
        }

        if (!newPassword.equals(confirmPassword)) {
            return new AuthResponse(false, "Passwords do not match");
        }

        // Find user
        var userOpt = identifier.contains("@")
                ? userRepository.findByEmail(identifier)
                : userRepository.findByUsername(identifier);

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();
        String passwordHash = hashPassword(newPassword);
        user.setPasswordHash(passwordHash);
        userRepository.save(user);

        return new AuthResponse(true, "Password reset successful");
    }

    // ============================================================================
    // REFRESH TOKEN
    // ============================================================================

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return new AuthResponse(false, "Refresh token is required");
        }

        // Validate refresh token
        if (!jwtTokenUtil.isRefreshToken(refreshToken)) {
            return new AuthResponse(false, "Invalid refresh token");
        }

        Long userId = jwtTokenUtil.getUserIdFromToken(refreshToken);
        if (userId == null) {
            return new AuthResponse(false, "Invalid refresh token");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        // Check if refresh token matches and is not expired
        if (!refreshToken.equals(user.getRefreshToken()) ||
                user.getRefreshTokenExpiry() == null ||
                user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            return new AuthResponse(false, "Refresh token expired or invalid");
        }

        // Generate new access token
        String newAccessToken = jwtTokenUtil.generateToken(user.getId(), user.getEmail(), user.getUsername());

        user.setSessionToken(newAccessToken);
        user.setSessionTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        userRepository.save(user);

        UserDto userDto = UserDto.fromEntity(user);
        return new AuthResponse(true, "Token refreshed", newAccessToken, refreshToken, userDto);
    }

    // ============================================================================
    // TOKEN UTILITIES
    // ============================================================================

    public User getUserFromToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        String resolvedToken = token;
        if (token.toLowerCase().startsWith("bearer ")) {
            resolvedToken = token.substring(7).trim();
        }

        if (resolvedToken.isEmpty() || resolvedToken.equals("null") || resolvedToken.equals("undefined")) {
            return null;
        }

        // Try JWT validation first
        Long userId = jwtTokenUtil.getUserIdFromToken(resolvedToken);
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Check if token is expired
                if (user.getSessionTokenExpiry() != null &&
                        user.getSessionTokenExpiry().isAfter(Instant.now())) {
                    return user;
                }
            }
        }

        // Fallback to session token lookup (backwards compatibility)
        return userRepository.findBySessionToken(resolvedToken).orElse(null);
    }

    public String getEmailFromToken(String token) {
        return jwtTokenUtil.getEmailFromToken(token);
    }

    public String getPhoneNumberFromToken(String token) {
        // Deprecated - kept for backwards compatibility
        return null;
    }

    public String getIdentifierFromToken(String token) {
        return jwtTokenUtil.getEmailFromToken(token);
    }
}

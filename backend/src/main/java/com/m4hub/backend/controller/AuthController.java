package com.m4hub.backend.controller;

import com.m4hub.backend.dto.*;
import com.m4hub.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        logger.info("Forgot password request for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.forgotPassword(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<AuthResponse> sendEmailOtp(@RequestBody SendEmailOtpRequest request) {
        try {
            AuthResponse response = authService.sendEmailOtp(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginWithEmail(@RequestBody com.m4hub.backend.dto.LoginRequest request) {
        try {
            logger.info("Login attempt for identifier: {}", request.getEmail());
            AuthResponse response = authService.loginWithEmail(request);
            if (response.isSuccess()) {
                logger.info("Login successful for: {}", request.getEmail());
                return ResponseEntity.ok(response);
            }
            logger.warn("Login failed for: {} - Reason: {}", request.getEmail(), response.getMessage());
            return ResponseEntity.status(401).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error during login for: {}", request.getEmail(), e);
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<AuthResponse> verifyEmailOtp(@RequestBody VerifyEmailOtpRequest request) {
        try {
            AuthResponse response = authService.verifyEmailOtp(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/resend-email-otp")
    public ResponseEntity<AuthResponse> resendEmailOtp(@RequestBody SendEmailOtpRequest request) {
        try {
            AuthResponse response = authService.resendEmailOtp(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody java.util.Map<String, String> body) {
        try {
            String refreshToken = body.get("refreshToken");

            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse(false, "Refresh token is required"));
            }

            AuthResponse response = authService.refreshToken(refreshToken);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    new AuthResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }
}

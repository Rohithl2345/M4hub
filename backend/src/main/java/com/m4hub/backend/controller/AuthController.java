package com.m4hub.backend.controller;

import com.m4hub.backend.dto.LoginRequest;
import com.m4hub.backend.dto.LoginResponse;
import com.m4hub.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            String token = jwtTokenProvider.generateToken(authentication);
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400L));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401)
                    .body(new com.m4hub.backend.dto.ErrorResponse(
                            401,
                            "Invalid username or password",
                            "AUTHENTICATION_FAILED",
                            System.currentTimeMillis(),
                            "/api/auth/login"
                    ));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400L));
            }
        }
        return ResponseEntity.status(401)
                .body(new com.m4hub.backend.dto.ErrorResponse(
                        401,
                        "Invalid or expired token",
                        "INVALID_TOKEN",
                        System.currentTimeMillis(),
                        "/api/auth/validate"
                ));
    }
}

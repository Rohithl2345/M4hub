package com.m4hub.backend.controller;

import com.m4hub.backend.dto.ApiResponse;
import com.m4hub.backend.dto.ProfileSetupRequest;
import com.m4hub.backend.dto.UserDto;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.UserRepository;
import com.m4hub.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    /**
     * Get user by token (supports both phone and email authentication)
     */
    private User getUserFromToken(String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            throw new RuntimeException("Invalid or expired session token");
        }
        return user;
    }

    /**
     * Get user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            logger.debug("Fetching profile for user: {}", user.getEmail());

            UserDto userDto = UserDto.fromEntity(user);
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Setup user profile (first time after registration)
     */
    @PostMapping("/profile/setup")
    public ResponseEntity<ApiResponse<UserDto>> setupProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ProfileSetupRequest request) {
        try {
            User user = getUserFromToken(authHeader); // Update user profile
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setDateOfBirth(request.getDateOfBirth());
            user.setGender(request.getGender());

            // Set name as firstName + lastName
            user.setName(request.getFirstName() + " " + request.getLastName());

            // Handle Username
            if (request.getUsername() != null && !request.getUsername().isEmpty()) {
                String newUsername = request.getUsername().toLowerCase().trim();
                if (!newUsername.equals(user.getUsername())) {
                    if (userRepository.findByUsername(newUsername).isPresent()) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(false,
                                "Username " + newUsername + " is already taken."));
                    }
                    user.setUsername(newUsername);
                }
            }

            // Update email if provided and different from current
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                String newEmail = request.getEmail().toLowerCase().trim();
                if (!newEmail.equals(user.getEmail())) {
                    // Check if this email is already taken by ANOTHER user
                    if (userRepository.findByEmail(newEmail).isPresent()) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(false,
                                "Email " + newEmail + " is already taken by another account."));
                    }
                    user.setEmail(newEmail);
                }
            }

            // Update phone number if provided
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
                user.setPhoneNumber(request.getPhoneNumber());
            }

            User savedUser = userRepository.save(user);

            UserDto userDto = UserDto.fromEntity(savedUser);

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile setup completed successfully", userDto));
        } catch (Exception e) {
            logger.error("Profile setup failed for user: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to setup profile: " + e.getMessage(), null));
        }
    }

    /**
     * Check if username is available
     */
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Boolean>> checkUsername(@RequestParam String username) {
        if (username == null || username.length() < 3) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Username too short", false));
        }
        boolean available = userRepository.findByUsername(username.toLowerCase().trim()).isEmpty();
        return ResponseEntity
                .ok(new ApiResponse<>(true, available ? "Username is available" : "Username is taken", available));
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ProfileSetupRequest request) {
        try {
            User user = getUserFromToken(authHeader); // Update user profile
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setDateOfBirth(request.getDateOfBirth());
            user.setGender(request.getGender());
            user.setName(request.getFirstName() + " " + request.getLastName());

            if (request.getUsername() != null && !request.getUsername().isEmpty()) {
                String newUsername = request.getUsername().toLowerCase().trim();
                if (!newUsername.equals(user.getUsername())) {
                    if (userRepository.findByUsername(newUsername).isPresent()) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(false,
                                "Username " + newUsername + " is already taken."));
                    }
                    user.setUsername(newUsername);
                }
            }

            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                user.setEmail(request.getEmail());
            }

            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
                user.setPhoneNumber(request.getPhoneNumber());
            }

            User savedUser = userRepository.save(user);

            UserDto userDto = UserDto.fromEntity(savedUser);

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", userDto));
        } catch (Exception e) {
            logger.error("Profile update failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to update profile: " + e.getMessage(), null));
        }
    }

    /**
     * Update user email only
     */
    @PutMapping("/profile/update-email")
    public ResponseEntity<ApiResponse<UserDto>> updateEmail(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> emailRequest) {
        try {
            User user = getUserFromToken(authHeader);

            String email = emailRequest.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Email is required", null));
            }

            // Basic email validation
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Invalid email format", null));
            }

            user.setEmail(email);
            userRepository.save(user);

            UserDto userDto = UserDto.fromEntity(user);

            return ResponseEntity.ok(new ApiResponse<>(true, "Email updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to update email: " + e.getMessage(), null));
        }
    }

    /**
     * Update user username only
     */
    @PutMapping("/profile/update-username")
    public ResponseEntity<ApiResponse<UserDto>> updateUsername(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> usernameRequest) {
        try {
            User user = getUserFromToken(authHeader);

            String username = usernameRequest.get("username");
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Username is required", null));
            }

            username = username.toLowerCase().trim();
            if (username.length() < 3) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Username must be at least 3 characters", null));
            }

            if (!username.equals(user.getUsername())) {
                if (userRepository.findByUsername(username).isPresent()) {
                    return ResponseEntity.status(400)
                            .body(new ApiResponse<>(false, "Username " + username + " is already taken", null));
                }
                user.setUsername(username);
                userRepository.save(user);
            }

            UserDto userDto = UserDto.fromEntity(user);

            return ResponseEntity.ok(new ApiResponse<>(true, "Username updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to update username: " + e.getMessage(), null));
        }
    }

    /**
     * Update user phone number only
     */
    @PutMapping("/profile/update-phone")
    public ResponseEntity<ApiResponse<UserDto>> updatePhoneNumber(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> phoneRequest) {
        try {
            User user = getUserFromToken(authHeader);

            String phoneNumber = phoneRequest.get("phoneNumber");
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Phone number is required", null));
            }

            // Remove all non-digit characters for validation
            String cleanedPhone = phoneNumber.replaceAll("[^0-9]", "");

            // Validate phone number length (10-15 digits)
            if (cleanedPhone.length() < 10 || cleanedPhone.length() > 15) {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Phone number must be between 10 and 15 digits", null));
            }

            // Check if phone number is already taken by another user
            if (!phoneNumber.equals(user.getPhoneNumber())) {
                if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
                    return ResponseEntity.status(400)
                            .body(new ApiResponse<>(false, "Phone number " + phoneNumber + " is already registered",
                                    null));
                }
                user.setPhoneNumber(phoneNumber);
                userRepository.save(user);
            }

            UserDto userDto = UserDto.fromEntity(user);
            return ResponseEntity.ok(new ApiResponse<>(true, "Phone number updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to update phone number: " + e.getMessage(), null));
        }
    }

    /**
     * Mark tutorial as seen
     */
    @PostMapping("/tutorial-seen")
    public ResponseEntity<ApiResponse<UserDto>> markTutorialAsSeen(
            @RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            user.setHasSeenTutorial(true);
            userRepository.save(user);

            return ResponseEntity.ok(new ApiResponse<>(true, "Tutorial marked as seen", UserDto.fromEntity(user)));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Failed to update tutorial status: " + e.getMessage(), null));
        }
    }
}

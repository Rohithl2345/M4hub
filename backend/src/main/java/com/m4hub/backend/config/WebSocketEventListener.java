package com.m4hub.backend.config;

import com.m4hub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.util.Map;

@Component
public class WebSocketEventListener {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void resetUserStatus() {
        logger.info("Resetting all users to OFFLINE on startup...");
        userRepository.resetAllUsersStatus();
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userIdStr = headerAccessor.getFirstNativeHeader("userId");

        logger.debug("Connection attempt. UserId header: {}", userIdStr);

        if (userIdStr != null) {
            try {
                Long userId = Long.parseLong(userIdStr);

                // Store userId in session attributes for disconnect handling
                Map<String, Object> attributes = headerAccessor.getSessionAttributes();
                if (attributes != null) {
                    attributes.put("userId", userIdStr);
                    logger.debug("Stored userId {} in session attributes.", userIdStr);

                    // Set ACTIVE immediately
                    updateUserStatus(userId, true);
                    logger.info("User connected: {}", userId);
                } else {
                    logger.error("Session attributes are null in ConnectEvent. Cannot store userId.");
                }

            } catch (NumberFormatException e) {
                logger.error("Invalid userId in connect header: {}", userIdStr);
            }
        } else {
            logger.debug("No userId header in connection.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        if (attributes != null) {
            String userIdStr = (String) attributes.get("userId");
            if (userIdStr != null) {
                try {
                    Long userId = Long.parseLong(userIdStr);
                    updateUserStatus(userId, false);
                    logger.info("User disconnected: {}", userId);
                } catch (NumberFormatException e) {
                    logger.error("Invalid userId in session attributes: {}", userIdStr);
                }
            } else {
                logger.debug("No userId found in session attributes during disconnect.");
            }
        } else {
            logger.debug("Session attributes are null during disconnect.");
        }
    }

    private void updateUserStatus(Long userId, boolean isActive) {
        // Direct update for speed
        try {
            userRepository.updateUserStatus(userId, isActive);
            logger.debug("Database updated. User {} isActive={}", userId, isActive);
        } catch (Exception e) {
            logger.error("Error updating user status", e);
        }

        // Broadcast status change to everyone
        messagingTemplate.convertAndSend("/topic/presence", Map.of(
                "userId", userId,
                "isActive", isActive));
    }
}

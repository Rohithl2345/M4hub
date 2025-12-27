package com.m4hub.backend.config;

import com.m4hub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashSet;
import java.util.Collections;

@Component
public class WebSocketEventListener {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WebSocketEventListener.class);

    // Track active sessions per user to handle multiple tabs/devices correctly
    private final Map<Long, Set<String>> userSessions = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void resetUserStatus() {
        logger.info("Resetting all users to OFFLINE on startup...");
        userRepository.resetAllUsersStatus();
        userSessions.clear();
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userIdStr = headerAccessor.getFirstNativeHeader("userId");
        String sessionId = headerAccessor.getSessionId();

        logger.debug("Connection attempt. UserId header: {}, SessionId: {}", userIdStr, sessionId);

        if (userIdStr != null && sessionId != null) {
            try {
                Long userId = Long.parseLong(userIdStr);

                // Store userId in session attributes for disconnect handling
                Map<String, Object> attributes = headerAccessor.getSessionAttributes();
                if (attributes != null) {
                    attributes.put("userId", userIdStr);

                    // Add session to tracking
                    userSessions.computeIfAbsent(userId, k -> Collections.synchronizedSet(new HashSet<>()))
                            .add(sessionId);

                    int activeCount = userSessions.get(userId).size();
                    logger.info("User {} connected. Session: {}. Active sessions: {}", userId, sessionId, activeCount);

                    // If it's the first session, update status to ACTIVE
                    if (activeCount == 1) {
                        updateUserStatus(userId, true);
                    } else {
                        // Already active, but we can still broadcast to ensure consistency
                        broadcastPresence(userId, true);
                    }
                } else {
                    logger.error("Session attributes are null in ConnectEvent. Cannot store userId.");
                }

            } catch (NumberFormatException e) {
                logger.error("Invalid userId in connect header: {}", userIdStr);
            }
        } else {
            logger.debug("No userId header or sessionId in connection.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        if (attributes != null && sessionId != null) {
            String userIdStr = (String) attributes.get("userId");
            if (userIdStr != null) {
                try {
                    Long userId = Long.parseLong(userIdStr);

                    // Remove session from tracking
                    Set<String> sessions = userSessions.get(userId);
                    if (sessions != null) {
                        sessions.remove(sessionId);
                        int remainingCount = sessions.size();
                        logger.info("User {} disconnected session {}. Remaining sessions: {}", userId, sessionId,
                                remainingCount);

                        // If no more sessions, update status to OFFLINE
                        if (remainingCount == 0) {
                            userSessions.remove(userId);
                            updateUserStatus(userId, false);
                        }
                    } else {
                        logger.warn("No session tracking found for user {} during disconnect", userId);
                        // Fallback: update status to false just in case
                        updateUserStatus(userId, false);
                    }
                } catch (NumberFormatException e) {
                    logger.error("Invalid userId in session attributes: {}", userIdStr);
                }
            } else {
                logger.debug("No userId found in session attributes during disconnect.");
            }
        } else {
            logger.debug("Session attributes or sessionId are null during disconnect.");
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

        broadcastPresence(userId, isActive);
    }

    private void broadcastPresence(Long userId, boolean isActive) {
        // Broadcast status change to everyone
        messagingTemplate.convertAndSend("/topic/presence", Map.of(
                "userId", userId,
                "isActive", isActive));
    }
}

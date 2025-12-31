package com.m4hub.backend.controller;

import com.m4hub.backend.model.ChatMessage;
import com.m4hub.backend.model.FriendRequest;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.ChatMessageRepository;
import com.m4hub.backend.service.AuthService;
import com.m4hub.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- Friend Requests ---

    @PostMapping("/request/send")
    public ResponseEntity<?> sendRequest(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> payload) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
            }

            if (payload.containsKey("userId")) {
                Long userId = Long.valueOf(payload.get("userId").toString());
                chatService.sendFriendRequestById(user.getId(), userId);
            } else if (payload.containsKey("username")) {
                String username = (String) payload.get("username");
                chatService.sendFriendRequest(user.getId(), username);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Username or User ID required"));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Request sent"));
        } catch (Exception e) {
            logger.error("Error sending friend request: ", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Unable to send friend request. Please try again."));
        }
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequest>> getPendingRequests(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.getPendingRequests(user.getId()));
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequest>> getSentRequests(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.getSentRequests(user.getId()));
    }

    @PostMapping("/request/accept")
    public ResponseEntity<?> acceptRequest(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Long> payload) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        chatService.acceptRequest(payload.get("requestId"), user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/request/reject")
    public ResponseEntity<?> rejectRequest(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Long> payload) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        chatService.rejectRequest(payload.get("requestId"), user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<com.m4hub.backend.dto.FriendDto>> getFriends(
            @RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<User> friends = chatService.getFriends(user.getId());
        List<com.m4hub.backend.dto.FriendDto> results = friends.stream()
                .map(f -> {
                    com.m4hub.backend.dto.FriendDto dto = com.m4hub.backend.dto.FriendDto.fromEntity(f);

                    // Fetch last message
                    List<ChatMessage> lastMsgs = chatMessageRepository.findLastMessages(user.getId(), f.getId(),
                            org.springframework.data.domain.PageRequest.of(0, 1));
                    ChatMessage lastMsg = lastMsgs.isEmpty() ? null : lastMsgs.get(0);
                    if (lastMsg != null) {
                        dto.setLastMessageContent(lastMsg.getContent());
                        dto.setLastMessageAt(lastMsg.getCreatedAt());
                    }
                    return dto;
                })
                .toList();
        return ResponseEntity.ok(results);
    }

    // --- Messages ---

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> payload) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String content = (String) payload.get("content");
        String messageType = payload.containsKey("messageType") ? (String) payload.get("messageType") : "TEXT";
        String mediaUrl = (String) payload.get("mediaUrl");

        chatService.sendMessage(user.getId(), receiverId, content, messageType, mediaUrl);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<?> getConversation(@RequestHeader("Authorization") String token,
            @PathVariable Long otherUserId) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        // chatService.markAsRead(user.getId(), otherUserId); // Auto mark as read when
        // fetching
        return ResponseEntity.ok(chatService.getConversation(user.getId(), otherUserId));
    }

    // --- WebSocket Handlers ---

    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload Map<String, Object> payload) {
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            String content = (String) payload.get("content");
            String messageType = payload.containsKey("messageType") ? (String) payload.get("messageType") : "TEXT";
            String mediaUrl = payload.containsKey("mediaUrl") ? (String) payload.get("mediaUrl") : null;

            chatService.sendMessage(senderId, receiverId, content, messageType, mediaUrl);
        } catch (Exception e) {
            logger.error("Error sending message via WebSocket", e);
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            boolean isTyping = (boolean) payload.get("isTyping");

            // Send typing indicator to receiver
            messagingTemplate.convertAndSend("/queue/typing/" + receiverId, Map.of(
                    "userId", userId,
                    "isTyping", isTyping));
        } catch (Exception e) {
            logger.error("Error handling typing indicator", e);
        }
    }

    @MessageMapping("/chat.delivered")
    public void markAsDelivered(@Payload Map<String, Object> payload) {
        try {
            Long messageId = Long.valueOf(payload.get("messageId").toString());
            chatService.markAsDelivered(messageId);
        } catch (Exception e) {
            logger.error("Error marking message as delivered", e);
        }
    }

    @MessageMapping("/chat.read")
    public void markAsReadViaWebSocket(@Payload Map<String, Object> payload) {
        try {
            Long messageId = Long.valueOf(payload.get("messageId").toString());
            Long senderId = Long.valueOf(payload.get("senderId").toString());

            chatService.markMessageAsRead(messageId);

            // Notify sender that message was read
            messagingTemplate.convertAndSend("/queue/read/" + senderId, Map.of(
                    "messageId", messageId,
                    "readAt", java.time.Instant.now().toString()));
        } catch (Exception e) {
            logger.error("Error marking message as read via WebSocket", e);
        }
    }

    // --- Message Reactions ---

    @PostMapping("/message/{messageId}/reaction")
    public ResponseEntity<?> addReaction(@RequestHeader("Authorization") String token,
            @PathVariable Long messageId,
            @RequestBody Map<String, String> payload) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            String emoji = payload.get("emoji");
            chatService.addReaction(messageId, user.getId(), emoji);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            logger.error("Error adding reaction: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add reaction."));
        }
    }

    @DeleteMapping("/message/{messageId}/reaction")
    public ResponseEntity<?> removeReaction(@RequestHeader("Authorization") String token,
            @PathVariable Long messageId) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            chatService.removeReaction(messageId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            logger.error("Error removing reaction: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to remove reaction."));
        }
    }

    @GetMapping("/message/{messageId}/reactions")
    public ResponseEntity<?> getReactions(@RequestHeader("Authorization") String token,
            @PathVariable Long messageId) {
        try {
            return ResponseEntity.ok(chatService.getReactions(messageId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Group Chat ---

    @PostMapping("/group/create")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createGroup(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> payload) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            List<Long> memberIds = payload.containsKey("memberIds")
                    ? ((List<?>) payload.get("memberIds")).stream().map(o -> Long.valueOf(o.toString())).toList()
                    : new java.util.ArrayList<>();

            return ResponseEntity.ok(new com.m4hub.backend.dto.GroupChatDto(
                    chatService.createGroup(user.getId(), name, description, memberIds)));
        } catch (Exception e) {
            logger.error("Error creating group: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to create group at this time."));
        }
    }

    @PostMapping("/group/{groupId}/members")
    public ResponseEntity<?> addGroupMember(@RequestHeader("Authorization") String token,
            @PathVariable Long groupId,
            @RequestBody Map<String, Long> payload) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            Long userId = payload.get("userId");
            chatService.addGroupMember(groupId, userId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            logger.error("Error adding group member: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to add member to group."));
        }
    }

    @GetMapping("/groups")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> getGroups(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            List<com.m4hub.backend.model.GroupChat> groups = chatService.getUserGroups(user.getId());
            List<com.m4hub.backend.dto.GroupChatDto> dtos = groups.stream()
                    .map(com.m4hub.backend.dto.GroupChatDto::new)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching groups: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to fetch groups."));
        }
    }

    @GetMapping("/group/{groupId}/messages")
    public ResponseEntity<?> getGroupMessages(@RequestHeader("Authorization") String token,
            @PathVariable Long groupId) {
        try {
            User user = authService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            return ResponseEntity.ok(chatService.getGroupMessages(groupId, user.getId()));
        } catch (Exception e) {
            logger.error("Error fetching group messages: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to fetch group messages."));
        }
    }

    @MessageMapping("/group.send")
    public void sendGroupMessage(@Payload Map<String, Object> payload) {
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long groupId = Long.valueOf(payload.get("groupId").toString());
            String content = (String) payload.get("content");
            String messageType = payload.containsKey("messageType") ? (String) payload.get("messageType") : "TEXT";

            // Send message and broadcast to all group members
            chatService.sendGroupMessage(groupId, senderId, content, messageType);
        } catch (Exception e) {
            logger.error("Error sending group message", e);
        }
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<?> deleteGroup(@RequestHeader("Authorization") String token, @PathVariable Long groupId) {
        try {
            User currentUser = authService.getUserFromToken(token);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            chatService.deleteGroup(groupId, currentUser.getId());
            return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting group: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to delete group."));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestHeader("Authorization") String token, @RequestParam String query) {
        try {
            User currentUser = authService.getUserFromToken(token);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<User> users = chatService.searchUsers(query);

            // Filter out current user and map to DTO
            List<com.m4hub.backend.dto.UserDto> results = users.stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .map(com.m4hub.backend.dto.UserDto::fromEntity)
                    .toList();

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching users: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Search failed. Please try again."));
        }
    }
}

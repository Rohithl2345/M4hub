package com.m4hub.backend.service;

import com.m4hub.backend.model.ChatMessage;
import com.m4hub.backend.model.FriendRequest;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.ChatMessageRepository;
import com.m4hub.backend.repository.FriendRequestRepository;
import com.m4hub.backend.repository.UserRepository;
import com.m4hub.backend.repository.MessageReactionRepository;
import com.m4hub.backend.repository.GroupChatRepository;
import com.m4hub.backend.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ChatService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private MessageReactionRepository messageReactionRepository;

    @Autowired
    private GroupChatRepository groupChatRepository;

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- Friend Requests ---

    public FriendRequest sendFriendRequest(Long senderId, String receiverUsername) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + receiverUsername));

        return createFriendRequest(sender, receiver);
    }

    public FriendRequest sendFriendRequestById(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        return createFriendRequest(sender, receiver);
    }

    private FriendRequest createFriendRequest(User sender, User receiver) {
        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot send request to yourself");
        }

        if (friendRequestRepository.existsByUsers(sender, receiver)) {
            throw new RuntimeException("Connection already exists or is pending");
        }

        FriendRequest request = new FriendRequest(sender, receiver, FriendRequest.Status.PENDING);
        FriendRequest saved = friendRequestRepository.save(request);

        // Notify the receiver via WebSocket
        try {
            messagingTemplate.convertAndSend("/queue/requests/" + receiver.getId(),
                    Map.of("type", "FRIEND_REQUEST", "action", "RELOAD"));
            logger.debug("Sent real-time notification to user ID: {}", receiver.getId());
        } catch (Exception e) {
            logger.error("Failed to send WebSocket notification", e);
        }

        return saved;
    }

    public List<FriendRequest> getPendingRequests(Long userId) {
        logger.debug("Fetching pending requests for user ID: {}", userId);
        List<FriendRequest> requests = friendRequestRepository.findByReceiverIdAndStatus(userId,
                FriendRequest.Status.PENDING);
        logger.debug("Found {} pending requests", requests.size());
        return requests;
    }

    public List<FriendRequest> getSentRequests(Long userId) {
        logger.debug("Fetching sent requests for user ID: {}", userId);
        List<FriendRequest> requests = friendRequestRepository.findBySenderIdAndStatus(userId,
                FriendRequest.Status.PENDING);
        logger.debug("Found {} sent requests", requests.size());
        return requests;
    }

    public void acceptRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        request.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(request);
    }

    public void rejectRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        request.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepository.save(request);
    }

    public List<User> getFriends(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<FriendRequest> connections = friendRequestRepository.findAcceptedRequests(user);

        List<User> friends = new ArrayList<>();
        for (FriendRequest fr : connections) {
            if (fr.getSender().getId().equals(userId)) {
                friends.add(fr.getReceiver());
            } else {
                friends.add(fr.getSender());
            }
        }
        return friends;
    }

    // --- Chat Messages ---

    public ChatMessage sendMessage(Long senderId, Long receiverId, String content, String messageType,
            String mediaUrl) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = new ChatMessage(sender, receiver, content);
        message.setMessageType(messageType);
        message.setMediaUrl(mediaUrl);
        ChatMessage saved = chatMessageRepository.save(message);

        // Broadcast real-time notifications
        try {
            Map<String, Object> payload = Map.of(
                    "id", saved.getId(),
                    "senderId", senderId,
                    "receiverId", receiverId,
                    "content", content,
                    "messageType", messageType,
                    "mediaUrl", mediaUrl != null ? mediaUrl : "",
                    "createdAt", saved.getCreatedAt().toString(),
                    "isRead", false,
                    "isDelivered", false);

            // Send to receiver
            messagingTemplate.convertAndSend("/queue/messages/" + receiverId, payload);
            // Send feedback to sender
            messagingTemplate.convertAndSend("/queue/messages/" + senderId, payload);

            logger.info("Broadcasted message from {} to {}", senderId, receiverId);
        } catch (Exception e) {
            logger.error("Failed to broadcast message via WebSocket", e);
        }

        return saved;
    }

    public List<ChatMessage> getConversation(Long userId, Long otherUserId) {
        User user1 = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        List<ChatMessage> messages = chatMessageRepository.findConversation(user1, user2);

        // Mark as read if user is receiver
        /*
         * for (ChatMessage msg : messages) {
         * if (msg.getReceiver().getId().equals(userId) && !msg.isRead()) {
         * msg.setRead(true);
         * chatMessageRepository.save(msg);
         * }
         * }
         */
        return messages;
    }

    @Transactional
    public void markAsRead(Long userId, Long otherUserId) {
        User user1 = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(otherUserId).orElseThrow(() -> new RuntimeException("User 2 not found"));
        List<ChatMessage> messages = chatMessageRepository.findConversation(user1, user2);
        for (ChatMessage msg : messages) {
            if (msg.getReceiver().getId().equals(userId) && !msg.isRead()) {
                msg.setRead(true);
                chatMessageRepository.save(msg);
            }
        }
    }

    // Search users by username or name
    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }

    // Mark message as delivered
    @Transactional
    public void markAsDelivered(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeliveredAt(java.time.Instant.now());
        chatMessageRepository.save(message);
    }

    // Mark message as read
    @Transactional
    public void markMessageAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setReadAt(java.time.Instant.now());
        chatMessageRepository.save(message);
    }

    // Message Reactions
    @Transactional
    public void addReaction(Long messageId, Long userId, String emoji) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already reacted
        Optional<com.m4hub.backend.model.MessageReaction> existing = messageReactionRepository
                .findByMessageAndUser(message, user);

        if (existing.isPresent()) {
            // Update existing reaction
            com.m4hub.backend.model.MessageReaction reaction = existing.get();
            reaction.setEmoji(emoji);
            messageReactionRepository.save(reaction);
        } else {
            // Create new reaction
            com.m4hub.backend.model.MessageReaction reaction = new com.m4hub.backend.model.MessageReaction(message,
                    user, emoji);
            messageReactionRepository.save(reaction);
        }
    }

    @Transactional
    public void removeReaction(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        messageReactionRepository.deleteByMessageAndUser(message, user);
    }

    public List<com.m4hub.backend.model.MessageReaction> getReactions(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        return messageReactionRepository.findByMessage(message);
    }

    // Group Chat
    @Transactional
    public com.m4hub.backend.model.GroupChat createGroup(Long creatorId, String name, String description) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.m4hub.backend.model.GroupChat group = new com.m4hub.backend.model.GroupChat(name, creator);
        group.setDescription(description);
        return groupChatRepository.save(group);
    }

    @Transactional
    public void addGroupMember(Long groupId, Long userId, Long requesterId) {
        com.m4hub.backend.model.GroupChat group = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify requester is a member
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        if (!group.getMembers().contains(requester)) {
            throw new RuntimeException("Unauthorized");
        }

        group.getMembers().add(user);
        groupChatRepository.save(group);
    }

    @Transactional
    public List<com.m4hub.backend.model.GroupChat> getUserGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return groupChatRepository.findByMember(user);
    }

    @Transactional
    public void sendGroupMessage(Long groupId, Long senderId, String content, String messageType) {
        com.m4hub.backend.model.GroupChat group = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is a member
        if (!group.getMembers().contains(sender)) {
            throw new RuntimeException("Unauthorized");
        }

        com.m4hub.backend.model.GroupMessage message = new com.m4hub.backend.model.GroupMessage(group, sender, content);
        message.setMessageType(messageType);
        com.m4hub.backend.model.GroupMessage saved = groupMessageRepository.save(message);

        group.setLastMessageAt(java.time.Instant.now());
        groupChatRepository.save(group);

        // Broadcast to each member of the group
        try {
            Map<String, Object> payload = Map.of(
                    "id", saved.getId(),
                    "groupId", groupId, // Still include groupId for clarity
                    "senderId", senderId,
                    "receiverId", groupId, // IMPORTANT: Frontend uses receiverId to match active group
                    "senderName", sender.getName() != null ? sender.getName() : sender.getUsername(),
                    "content", content,
                    "messageType", messageType,
                    "createdAt", saved.getCreatedAt().toString(),
                    "isGroup", true);

            // Send to ALL members' private queues
            for (User member : group.getMembers()) {
                messagingTemplate.convertAndSend("/queue/messages/" + member.getId(), payload);
            }
            logger.info("Broadcasted group message to {} members of group {}", group.getMembers().size(), groupId);
        } catch (Exception e) {
            logger.error("Failed to broadcast group message", e);
        }
    }

    public List<com.m4hub.backend.model.GroupMessage> getGroupMessages(Long groupId, Long userId) {
        com.m4hub.backend.model.GroupChat group = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is a member
        if (!group.getMembers().contains(user)) {
            throw new RuntimeException("Unauthorized");
        }

        return groupMessageRepository.findByGroupOrderByCreatedAtAsc(group);
    }
}

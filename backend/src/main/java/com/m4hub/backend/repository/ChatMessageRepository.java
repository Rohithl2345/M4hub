package com.m4hub.backend.repository;

import com.m4hub.backend.model.ChatMessage;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Get conversation between two users ordered by time
    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender = :user1 AND cm.receiver = :user2) OR (cm.sender = :user2 AND cm.receiver = :user1) ORDER BY cm.createdAt ASC")
    List<ChatMessage> findConversation(User user1, User user2);

    // Get unread messages count for a user
    long countByReceiverAndIsReadFalse(User receiver);
    
    // Get last message in conversation
    @Query(value = "SELECT * FROM chat_messages WHERE (sender_id = :userId1 AND receiver_id = :userId2) OR (sender_id = :userId2 AND receiver_id = :userId1) ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    ChatMessage findLastMessage(Long userId1, Long userId2);
}

package com.m4hub.backend.repository;

import com.m4hub.backend.model.ChatMessage;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Pageable;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Get conversation between two users ordered by time
    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender = :user1 AND cm.receiver = :user2) OR (cm.sender = :user2 AND cm.receiver = :user1) ORDER BY cm.createdAt ASC")
    List<ChatMessage> findConversation(User user1, User user2);

    // Get unread messages count for a user
    long countByReceiverAndIsReadFalse(User receiver);

    // Get last message in conversation (JPQL)
    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR (cm.sender.id = :userId2 AND cm.receiver.id = :userId1) ORDER BY cm.createdAt DESC")
    List<ChatMessage> findLastMessages(Long userId1, Long userId2, Pageable pageable);
}

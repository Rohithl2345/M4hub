package com.m4hub.backend.repository;

import com.m4hub.backend.model.MessageReaction;
import com.m4hub.backend.model.ChatMessage;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    List<MessageReaction> findByMessage(ChatMessage message);
    Optional<MessageReaction> findByMessageAndUser(ChatMessage message, User user);
    void deleteByMessageAndUser(ChatMessage message, User user);
}

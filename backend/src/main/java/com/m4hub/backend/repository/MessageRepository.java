package com.m4hub.backend.repository;

import com.m4hub.backend.model.Conversation;
import com.m4hub.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderBySentAtAsc(Conversation conversation);
    List<Message> findByConversationOrderBySentAtDesc(Conversation conversation);
}

package com.m4hub.backend.repository;

import com.m4hub.backend.model.ChatRequest;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRequestRepository extends JpaRepository<ChatRequest, Long> {
    List<ChatRequest> findBySenderOrReceiver(User sender, User receiver);
    List<ChatRequest> findByReceiverAndStatus(User receiver, String status);
    List<ChatRequest> findBySenderAndStatus(User sender, String status);
    Optional<ChatRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, String status);
}

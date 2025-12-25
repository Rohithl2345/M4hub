package com.m4hub.backend.repository;

import com.m4hub.backend.model.GroupMessage;
import com.m4hub.backend.model.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByGroupOrderByCreatedAtAsc(GroupChat group);
    List<GroupMessage> findByGroupOrderByCreatedAtDesc(GroupChat group);
}

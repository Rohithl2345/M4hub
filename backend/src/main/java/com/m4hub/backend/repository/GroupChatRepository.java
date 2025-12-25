package com.m4hub.backend.repository;

import com.m4hub.backend.model.GroupChat;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    @Query("SELECT g FROM GroupChat g JOIN g.members m WHERE m = :user ORDER BY g.lastMessageAt DESC")
    List<GroupChat> findByMember(@Param("user") User user);
}

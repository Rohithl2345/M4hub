package com.m4hub.backend.repository;

import com.m4hub.backend.model.FriendRequest;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    // Find requests sent by user ID with status and eager fetch
    @Query("SELECT fr FROM FriendRequest fr JOIN FETCH fr.sender JOIN FETCH fr.receiver WHERE fr.sender.id = :senderId AND fr.status = :status")
    List<FriendRequest> findBySenderIdAndStatus(Long senderId, FriendRequest.Status status);

    // Find requests received by user ID with status and eager fetch
    @Query("SELECT fr FROM FriendRequest fr JOIN FETCH fr.sender JOIN FETCH fr.receiver WHERE fr.receiver.id = :receiverId AND fr.status = :status")
    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequest.Status status);

    // Find requests sent by user with eager fetch
    @Query("SELECT fr FROM FriendRequest fr JOIN FETCH fr.sender JOIN FETCH fr.receiver WHERE fr.sender = :sender")
    List<FriendRequest> findBySender(User sender);

    // Find requests received by user with eager fetch
    @Query("SELECT fr FROM FriendRequest fr JOIN FETCH fr.sender JOIN FETCH fr.receiver WHERE fr.receiver = :receiver")
    List<FriendRequest> findByReceiver(User receiver);

    // Check if request exists between two users
    @Query("SELECT case when count(fr)> 0 then true else false end FROM FriendRequest fr WHERE (fr.sender = :user1 AND fr.receiver = :user2) OR (fr.sender = :user2 AND fr.receiver = :user1)")
    boolean existsByUsers(User user1, User user2);

    // Find pending request between two users
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.status = 'PENDING' AND ((fr.sender = :user1 AND fr.receiver = :user2) OR (fr.sender = :user2 AND fr.receiver = :user1))")
    Optional<FriendRequest> findPendingRequest(User user1, User user2);

    // Find list of friends (accepted requests where user is sender or receiver)
    // with eager fetch
    @Query("SELECT fr FROM FriendRequest fr JOIN FETCH fr.sender JOIN FETCH fr.receiver WHERE fr.status = 'ACCEPTED' AND (fr.sender = :user OR fr.receiver = :user)")
    List<FriendRequest> findAcceptedRequests(User user);
}

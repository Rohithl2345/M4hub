package com.m4hub.backend.repository;

import com.m4hub.backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserId(Long userId);
    
    Optional<Wishlist> findByUserIdAndSongId(Long userId, Long songId);
    
    boolean existsByUserIdAndSongId(Long userId, Long songId);
    
    void deleteByUserIdAndSongId(Long userId, Long songId);
}

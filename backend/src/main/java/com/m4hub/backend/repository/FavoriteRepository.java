package com.m4hub.backend.repository;

import com.m4hub.backend.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    List<Favorite> findByUserId(Long userId);
    
    Optional<Favorite> findByUserIdAndSongId(Long userId, Long songId);
    
    boolean existsByUserIdAndSongId(Long userId, Long songId);
    
    void deleteByUserIdAndSongId(Long userId, Long songId);
}

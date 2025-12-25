package com.m4hub.backend.repository;

import com.m4hub.backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    
    Optional<Song> findByExternalId(String externalId);
    
    @Query("SELECT s FROM Song s WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.album) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.genre) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Song> searchSongs(@Param("query") String query);
    
    List<Song> findByGenre(String genre);
    
    List<Song> findByArtist(String artist);
}

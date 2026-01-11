package com.m4hub.backend.repository;

import com.m4hub.backend.model.Playlist;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Playlist p LEFT JOIN FETCH p.tracks WHERE p.owner = :owner")
    List<Playlist> findByOwnerWithTracks(@org.springframework.data.repository.query.Param("owner") User owner);

    List<Playlist> findByIsPublicTrue();

    boolean existsByNameAndOwnerId(String name, Long ownerId);
}

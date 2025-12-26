package com.m4hub.backend.repository;

import com.m4hub.backend.model.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    Optional<NewsArticle> findByExternalId(String externalId);

    List<NewsArticle> findByCategoryOrderByPublishedAtDesc(String category);

    List<NewsArticle> findAllByOrderByPublishedAtDesc();
}

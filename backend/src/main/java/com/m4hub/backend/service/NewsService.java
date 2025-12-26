package com.m4hub.backend.service;

import com.m4hub.backend.model.NewsArticle;
import com.m4hub.backend.repository.NewsArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NewsService {
    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);

    private final NewsArticleRepository newsArticleRepository;
    private final RestTemplate restTemplate;

    @Value("${news.api.key:pub_631980327f7a2f5f1345d4c795267e1a3b118}") // Example public key or placeholder
    private String apiKey;

    public NewsService(NewsArticleRepository newsArticleRepository, RestTemplate restTemplate) {
        this.newsArticleRepository = newsArticleRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public void syncNewsFromExternalSource() {
        logger.info("Starting sync of news from external API...");

        // Using NewsData.io format as an example (more generous free tier)
        String url = String.format(
                "https://newsdata.io/api/1/news?apikey=%s&language=en&category=technology,business,sports,entertainment",
                apiKey);

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

                int savedCount = 0;
                for (Map<String, Object> articleData : results) {
                    String externalId = (String) articleData.get("article_id");

                    if (newsArticleRepository.findByExternalId(externalId).isEmpty()) {
                        NewsArticle article = new NewsArticle();
                        article.setExternalId(externalId);
                        article.setTitle((String) articleData.get("title"));
                        article.setDescription((String) articleData.get("description"));
                        article.setContent((String) articleData.get("content"));
                        article.setAuthor((String) articleData.get("creator"));
                        article.setSourceName((String) articleData.get("source_id"));
                        article.setUrl((String) articleData.get("link"));
                        article.setUrlToImage((String) articleData.get("image_url"));

                        String pubDate = (String) articleData.get("pubDate");
                        if (pubDate != null) {
                            try {
                                // NewsData.io format: 2024-12-26 06:14:12
                                String tidiedDate = pubDate.replace(" ", "T");
                                article.setPublishedAt(LocalDateTime.parse(tidiedDate));
                            } catch (Exception dateEx) {
                                article.setPublishedAt(LocalDateTime.now());
                            }
                        } else {
                            article.setPublishedAt(LocalDateTime.now());
                        }

                        List<String> categories = (List<String>) articleData.get("category");
                        if (categories != null && !categories.isEmpty()) {
                            article.setCategory(categories.get(0));
                        } else {
                            article.setCategory("General");
                        }

                        newsArticleRepository.save(article);
                        savedCount++;
                    }
                }
                logger.info("News sync complete. Saved {} new articles.", savedCount);
            }
        } catch (Exception e) {
            logger.error("Error during news sync: {}. Falling back to mock data.", e.getMessage());
        }

        // Fallback: If no news in DB, add mock news
        if (newsArticleRepository.count() == 0) {
            seedFallbackNews();
        }
    }

    private void seedFallbackNews() {
        logger.info("Seeding fallback mock news articles...");
        List<NewsArticle> mocks = new ArrayList<>();

        mocks.add(new NewsArticle(
                "AI Breakthrough in Quantum Computing",
                "Researchers have achieved a new milestone in combining AI with quantum processors.",
                "Tech Daily", "M4 News", "https://example.com/news1",
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
                LocalDateTime.now().minusHours(2), "Technology", "mock-news-1"));

        mocks.add(new NewsArticle(
                "Global Markets React to New Economic Policy",
                "Stock indexes showed mixed results following the announcement of early trade figures.",
                "Finance Week", "M4 Finance", "https://example.com/news2",
                "https://images.unsplash.com/photo-1611974714405-b0d80bb00278?w=800",
                LocalDateTime.now().minusHours(5), "Business", "mock-news-2"));

        mocks.add(new NewsArticle(
                "M4hub v2.0 Launch Announced",
                "The upcoming version of M4hub promises a revamped messaging experience and integrated news.",
                "Team M4", "Official Blog", "https://example.com/news3",
                "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800",
                LocalDateTime.now().minusDays(1), "Company", "mock-news-3"));

        newsArticleRepository.saveAll(mocks);
        logger.info("Successfully seeded 3 mock news articles.");
    }

    public List<NewsArticle> getAllNews() {
        return newsArticleRepository.findAllByOrderByPublishedAtDesc();
    }

    public List<NewsArticle> getNewsByCategory(String category) {
        return newsArticleRepository.findByCategoryOrderByPublishedAtDesc(category);
    }
}

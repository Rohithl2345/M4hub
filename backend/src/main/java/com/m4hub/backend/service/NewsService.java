package com.m4hub.backend.service;

import com.m4hub.backend.model.NewsArticle;
import com.m4hub.backend.repository.NewsArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
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
    @Scheduled(fixedRate = 7200000) // 2 hours
    @PostConstruct
    public void syncNewsFromExternalSource() {
        logger.info("Starting sync of news from open live API (ok.surf)...");

        String url = "https://ok.surf/api/v1/cors/news-feed";

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null) {
                int savedCount = 0;

                // ok.surf returns news grouped by categories: Business, Entertainment, Health,
                // Science, Sports, Technology, World
                String[] categories = { "Business", "Entertainment", "Health", "Science", "Sports", "Technology",
                        "World" };

                for (String category : categories) {
                    if (response.containsKey(category)) {
                        List<Map<String, Object>> articles = (List<Map<String, Object>>) response.get(category);

                        for (Map<String, Object> articleData : articles) {
                            String title = (String) articleData.get("title");
                            String link = (String) articleData.get("link");
                            String imageUrl = (String) articleData.get("og");
                            String sourceName = (String) articleData.get("source");

                            // Use a hash of the link as externalId to avoid length issues in DB
                            String externalId = String.valueOf(link.hashCode());
                            if (newsArticleRepository.findByExternalId(externalId).isEmpty()) {
                                NewsArticle article = new NewsArticle();
                                article.setExternalId(externalId);
                                article.setTitle(title);
                                article.setDescription(title); // This API doesn't provide excerpt, use title or
                                                               // generate
                                article.setSourceName(sourceName);
                                article.setUrl(link);
                                article.setUrlToImage(imageUrl);
                                article.setPublishedAt(LocalDateTime.now()); // API doesn't provide date, use current
                                article.setCategory(category);

                                newsArticleRepository.save(article);
                                savedCount++;
                            }
                        }
                    }
                }
                logger.info("Live News sync complete. Saved {} new articles.", savedCount);
            }
        } catch (Exception e) {
            logger.error("Error during live news sync: {}", e.getMessage());
        }
    }

    public List<NewsArticle> getAllNews() {
        return newsArticleRepository.findAllByOrderByPublishedAtDesc();
    }

    public List<NewsArticle> getNewsByCategory(String category) {
        return newsArticleRepository.findByCategoryOrderByPublishedAtDesc(category);
    }
}

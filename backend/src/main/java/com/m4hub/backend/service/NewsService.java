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
            logger.error("Error during live news sync: {}. Falling back to mock data.", e.getMessage());
        }

        // Fallback: If no news in DB, add mock news
        if (newsArticleRepository.count() == 0) {
            seedFallbackNews();
        }
    }

    private void seedFallbackNews() {
        logger.info("Clearing old news and seeding fresh fallback articles...");
        newsArticleRepository.deleteAll();
        List<NewsArticle> mocks = new ArrayList<>();

        mocks.add(new NewsArticle(
                "SpaceX Launches Next-Generation Starlink Satellites",
                "The latest mission successfully deployed 23 Starlink satellites into low-Earth orbit, furthering global connectivity.",
                "Space News", "BBC News", "https://www.bbc.com/news/technology",
                "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800",
                LocalDateTime.now().minusHours(2), "Technology", "mock-news-1"));

        mocks.add(new NewsArticle(
                "Global Stock Markets Settle After Volatile Week",
                "Investors weigh latest inflation data as major indices remain resilient amid economic shifts.",
                "Market Watch", "Reuters", "https://www.reuters.com/business/finance/",
                "https://images.unsplash.com/photo-1611974714405-b0d80bb00278?w=800",
                LocalDateTime.now().minusHours(5), "Business", "mock-news-2"));

        mocks.add(new NewsArticle(
                "Artificial Intelligence: The Future of Health Diagnostics",
                "New AI models are demonstrating unprecedented accuracy in early disease detection through medical imaging.",
                "Health Tech", "TechCrunch", "https://techcrunch.com/category/artificial-intelligence/",
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
                LocalDateTime.now().minusDays(1), "Science", "mock-news-3"));

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

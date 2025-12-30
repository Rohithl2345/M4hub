package com.m4hub.backend.service;

import com.m4hub.backend.dto.HubAnalyticsDto;
import com.m4hub.backend.model.TabUsage;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.TabUsageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private TabUsageRepository tabUsageRepository;

    private static final Map<String, String> TAB_COLORS = Map.of(
            "music", "#8b5cf6",
            "messages", "#3b82f6",
            "money", "#10b981",
            "news", "#f59e0b");

    private static final Map<String, String> TAB_ICONS = Map.of(
            "music", "musical-notes",
            "messages", "chatbubbles",
            "money", "wallet",
            "news", "newspaper");

    public HubAnalyticsDto getHubAnalytics(User user, String timeframe) {
        HubAnalyticsDto analytics = new HubAnalyticsDto();

        Instant since;
        switch (timeframe.toLowerCase()) {
            case "daily":
                since = Instant.now().minus(1, ChronoUnit.DAYS);
                break;
            case "weekly":
                since = Instant.now().minus(7, ChronoUnit.DAYS);
                break;
            case "monthly":
                since = Instant.now().minus(30, ChronoUnit.DAYS);
                break;
            case "yearly":
                since = Instant.now().minus(365, ChronoUnit.DAYS);
                break;
            default:
                since = Instant.now().minus(7, ChronoUnit.DAYS);
        }

        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        // Get tab analytics based on timeframe
        analytics.setTabAnalytics(calculateTabAnalytics(user, since));

        // Keep other metrics fixed for now or Todo: make them dynamic too
        analytics.setWeeklyActivity(calculateWeeklyActivity(user, sevenDaysAgo));
        analytics.setEngagementMetrics(calculateEngagementMetrics(user, thirtyDaysAgo, sevenDaysAgo));

        return analytics;
    }

    private List<HubAnalyticsDto.TabAnalytics> calculateTabAnalytics(User user, Instant since) {
        List<Map<String, Object>> aggregatedData = tabUsageRepository.aggregateUsageByUserAndTimestampAfter(user,
                since);

        // Calculate total duration across all tabs
        long totalDuration = aggregatedData.stream()
                .mapToLong(map -> ((Number) map.get("totalDuration")).longValue())
                .sum();

        if (totalDuration == 0) {
            // Return default data if no usage
            return getDefaultTabAnalytics();
        }

        // Get session counts
        Map<String, Long> sessionCounts = getSessionCounts(user, since);

        List<HubAnalyticsDto.TabAnalytics> tabAnalyticsList = new ArrayList<>();

        for (Map<String, Object> data : aggregatedData) {
            String tabName = (String) data.get("tabName");
            long duration = ((Number) data.get("totalDuration")).longValue();
            int percentage = (int) ((duration * 100) / totalDuration);
            int sessions = sessionCounts.getOrDefault(tabName, 0L).intValue();

            HubAnalyticsDto.TabAnalytics tabAnalytics = new HubAnalyticsDto.TabAnalytics(
                    capitalize(tabName),
                    percentage,
                    TAB_COLORS.getOrDefault(tabName.toLowerCase(), "#64748b"),
                    TAB_ICONS.getOrDefault(tabName.toLowerCase(), "apps"),
                    sessions,
                    duration);

            tabAnalyticsList.add(tabAnalytics);
        }

        // Sort by percentage descending
        tabAnalyticsList.sort((a, b) -> Integer.compare(b.getPercentage(), a.getPercentage()));

        return tabAnalyticsList;
    }

    private Map<String, Long> getSessionCounts(User user, Instant since) {
        List<TabUsage> usages = tabUsageRepository.findByUserAndTimestampAfter(user, since);

        return usages.stream()
                .collect(Collectors.groupingBy(TabUsage::getTabName, Collectors.counting()));
    }

    private List<Integer> calculateWeeklyActivity(User user, Instant since) {
        List<TabUsage> usages = tabUsageRepository.findByUserAndTimestampAfter(user, since);

        // Group by day
        Map<LocalDate, Long> dailyDurations = usages.stream()
                .collect(Collectors.groupingBy(
                        usage -> usage.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate(),
                        Collectors.summingLong(TabUsage::getDurationSeconds)));

        // Get last 7 days
        List<Integer> weeklyActivity = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long seconds = dailyDurations.getOrDefault(date, 0L);
            // Convert to minutes for better visualization
            weeklyActivity.add((int) (seconds / 60));
        }

        return weeklyActivity;
    }

    private HubAnalyticsDto.EngagementMetrics calculateEngagementMetrics(User user, Instant thirtyDaysAgo,
            Instant sevenDaysAgo) {
        HubAnalyticsDto.EngagementMetrics metrics = new HubAnalyticsDto.EngagementMetrics();

        // Calculate current week metrics
        List<TabUsage> currentWeekUsages = tabUsageRepository.findByUserAndTimestampAfter(user, sevenDaysAgo);
        long currentWeekSeconds = currentWeekUsages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        Set<String> currentWeekTabs = currentWeekUsages.stream().map(TabUsage::getTabName).collect(Collectors.toSet());

        // Calculate previous week metrics
        Instant fourteenDaysAgo = Instant.now().minus(14, ChronoUnit.DAYS);
        List<TabUsage> previousWeekUsages = tabUsageRepository.findByUserAndTimestampAfter(user, fourteenDaysAgo)
                .stream()
                .filter(usage -> usage.getTimestamp().isBefore(sevenDaysAgo))
                .collect(Collectors.toList());
        long previousWeekSeconds = previousWeekUsages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        Set<String> previousWeekTabs = previousWeekUsages.stream().map(TabUsage::getTabName)
                .collect(Collectors.toSet());

        // Daily active time (average per day for current week)
        double avgDailySeconds = currentWeekSeconds / 7.0;
        double avgDailyHours = avgDailySeconds / 3600.0;
        metrics.setDailyActiveTime(String.format("%.1fh", avgDailyHours));

        // Calculate change
        if (previousWeekSeconds > 0) {
            double timeChange = ((currentWeekSeconds - previousWeekSeconds) / (double) previousWeekSeconds) * 100;
            metrics.setDailyChange(String.format("%+.0f%%", timeChange));
        } else {
            metrics.setDailyChange("+100%");
        }

        // Features used
        int totalFeatures = 12; // Total available features
        int usedFeatures = currentWeekTabs.size();
        metrics.setFeaturesUsed(usedFeatures + "/" + totalFeatures);

        int featureChange = usedFeatures - previousWeekTabs.size();
        metrics.setFeaturesChange(featureChange >= 0 ? "+" + featureChange : String.valueOf(featureChange));

        // Engagement score (based on consistency and variety)
        int engagementScore = calculateEngagementScore(currentWeekUsages, usedFeatures, totalFeatures);
        metrics.setEngagementScore(engagementScore + "%");

        // For simplicity, show a positive change
        metrics.setScoreChange("+5%");

        return metrics;
    }

    private int calculateEngagementScore(List<TabUsage> usages, int usedFeatures, int totalFeatures) {
        if (usages.isEmpty())
            return 0;

        // Factor 1: Feature variety (40%)
        int varietyScore = (int) ((usedFeatures / (double) totalFeatures) * 40);

        // Factor 2: Consistency (30%) - how many days they were active
        Set<LocalDate> activeDays = usages.stream()
                .map(usage -> usage.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toSet());
        int consistencyScore = (int) ((activeDays.size() / 7.0) * 30);

        // Factor 3: Total engagement time (30%)
        long totalSeconds = usages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        int timeScore = Math.min(30, (int) (totalSeconds / 3600)); // 1 point per hour, max 30

        return Math.min(100, varietyScore + consistencyScore + timeScore);
    }

    private List<HubAnalyticsDto.TabAnalytics> getDefaultTabAnalytics() {
        // Return default data when user has no usage history
        return Arrays.asList(
                new HubAnalyticsDto.TabAnalytics("Music", 25, "#8b5cf6", "musical-notes", 0, 0),
                new HubAnalyticsDto.TabAnalytics("Messages", 25, "#3b82f6", "chatbubbles", 0, 0),
                new HubAnalyticsDto.TabAnalytics("Money", 25, "#10b981", "wallet", 0, 0),
                new HubAnalyticsDto.TabAnalytics("News", 25, "#f59e0b", "newspaper", 0, 0));
    }

    public void trackTabUsage(User user, String tabName, long durationSeconds) {
        TabUsage usage = new TabUsage(user, tabName.toLowerCase(), durationSeconds);
        tabUsageRepository.save(usage);
        logger.info("Tracked {} seconds for user {} on tab {}", durationSeconds, user.getEmail(), tabName);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}

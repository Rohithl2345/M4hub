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
        Instant previousSince;
        int daysInPeriod;

        switch (timeframe.toLowerCase()) {
            case "daily":
                since = Instant.now().minus(1, ChronoUnit.DAYS);
                previousSince = Instant.now().minus(2, ChronoUnit.DAYS);
                daysInPeriod = 1;
                break;
            case "weekly":
                since = Instant.now().minus(7, ChronoUnit.DAYS);
                previousSince = Instant.now().minus(14, ChronoUnit.DAYS);
                daysInPeriod = 7;
                break;
            case "monthly":
                since = Instant.now().minus(30, ChronoUnit.DAYS);
                previousSince = Instant.now().minus(60, ChronoUnit.DAYS);
                daysInPeriod = 30;
                break;
            case "yearly":
                since = Instant.now().minus(365, ChronoUnit.DAYS);
                previousSince = Instant.now().minus(730, ChronoUnit.DAYS);
                daysInPeriod = 365;
                break;
            default:
                since = Instant.now().minus(7, ChronoUnit.DAYS);
                previousSince = Instant.now().minus(14, ChronoUnit.DAYS);
                daysInPeriod = 7;
        }

        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS); // Keep weekly activity fixed for the chart

        // Get tab analytics based on timeframe
        analytics.setTabAnalytics(calculateTabAnalytics(user, since));

        // Keep weekly chart fixed for now (it's a "Weekly Activity" chart specifically)
        analytics.setWeeklyActivity(calculateWeeklyActivity(user, sevenDaysAgo));

        // Dynamic engagement metrics
        analytics.setEngagementMetrics(calculateEngagementMetrics(user, since, previousSince, daysInPeriod));

        return analytics;
    }

    // ... (keep calculateTabAnalytics and getSessionCounts and
    // calculateWeeklyActivity as is - skipping lines to avoid replacing them) ...

    private HubAnalyticsDto.EngagementMetrics calculateEngagementMetrics(User user, Instant currentPeriodStart,
            Instant previousPeriodStart, int daysInPeriod) {
        HubAnalyticsDto.EngagementMetrics metrics = new HubAnalyticsDto.EngagementMetrics();

        // Calculate current period metrics
        List<TabUsage> currentUsages = tabUsageRepository.findByUserAndTimestampAfter(user, currentPeriodStart);
        long currentSeconds = currentUsages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        Set<String> currentTabs = currentUsages.stream().map(TabUsage::getTabName).collect(Collectors.toSet());

        // Calculate previous period metrics
        List<TabUsage> previousUsages = tabUsageRepository.findByUserAndTimestampAfter(user, previousPeriodStart)
                .stream()
                .filter(usage -> usage.getTimestamp().isBefore(currentPeriodStart))
                .collect(Collectors.toList());
        long previousSeconds = previousUsages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        Set<String> previousTabs = previousUsages.stream().map(TabUsage::getTabName)
                .collect(Collectors.toSet());

        // Daily active time (average per day)
        double avgDailySeconds = currentSeconds / (double) daysInPeriod;
        double avgDailyHours = avgDailySeconds / 3600.0;

        if (avgDailyHours < 0.1 && avgDailySeconds > 0) {
            // Show minutes if hours is too small
            metrics.setDailyActiveTime(String.format("%.0fm", avgDailySeconds / 60));
        } else {
            metrics.setDailyActiveTime(String.format("%.1fh", avgDailyHours));
        }

        // Calculate change
        if (previousSeconds > 0) {
            double timeChange = ((currentSeconds - previousSeconds) / (double) previousSeconds) * 100;
            metrics.setDailyChange(String.format("%+.0f%%", timeChange));
        } else if (currentSeconds > 0) {
            metrics.setDailyChange("+100%");
        } else {
            metrics.setDailyChange("0%");
        }

        // Features used
        int totalFeatures = 12; // Total available features
        int usedFeatures = currentTabs.size();
        metrics.setFeaturesUsed(usedFeatures + "/" + totalFeatures);

        int featureChange = usedFeatures - previousTabs.size();
        metrics.setFeaturesChange(
                featureChange > 0 ? "+" + featureChange : (featureChange == 0 ? "0" : String.valueOf(featureChange)));

        // Engagement score (based on consistency and variety)
        int engagementScore = calculateEngagementScore(currentUsages, usedFeatures, totalFeatures, daysInPeriod);
        metrics.setEngagementScore(engagementScore + "%");

        // Simple score change estimation (randomized or calculated if history existed)
        metrics.setScoreChange("+5%"); // Placeholder for now

        return metrics;
    }

    private int calculateEngagementScore(List<TabUsage> usages, int usedFeatures, int totalFeatures, int daysInPeriod) {
        if (usages.isEmpty())
            return 0;

        // Factor 1: Feature variety (40%)
        int varietyScore = (int) ((usedFeatures / (double) totalFeatures) * 40);

        // Factor 2: Consistency (30%)
        Set<LocalDate> activeDays = usages.stream()
                .map(usage -> usage.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toSet());
        // Cap consistency at 100% of daysInPeriod
        double consistencyRatio = Math.min(1.0, activeDays.size() / (double) daysInPeriod);
        int consistencyScore = (int) (consistencyRatio * 30);

        // Factor 3: Total engagement time (30%)
        // Target: 1 hour per day average = max score
        long totalSeconds = usages.stream().mapToLong(TabUsage::getDurationSeconds).sum();
        double hoursPerDay = (totalSeconds / 3600.0) / daysInPeriod;
        int timeScore = Math.min(30, (int) (hoursPerDay * 30));

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

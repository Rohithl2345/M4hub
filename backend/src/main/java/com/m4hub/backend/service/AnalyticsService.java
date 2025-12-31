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

    // Service for handling all analytics calculations and data aggregation

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private TabUsageRepository tabUsageRepository;

    @Autowired
    private com.m4hub.backend.repository.UserRepository userRepository;

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

        // Keep weekly chart fixed for now (it's a "Weekly Activity" chart specifically)
        analytics.setWeeklyActivity(calculateActivityTrend(user, timeframe));

        // Dynamic engagement metrics
        analytics.setEngagementMetrics(calculateEngagementMetrics(user, since, previousSince, daysInPeriod));

        // Tab analytics
        analytics.setTabAnalytics(calculateTabAnalytics(user, since));

        return analytics;
    }

    private static final Map<String, String> TAB_DISPLAY_NAMES = Map.of(
            "dashboard", "Dashboard",
            "music", "Music",
            "messages", "Messages",
            "money", "Money",
            "news", "News",
            "profile", "Profile",
            "explore", "Profile");

    private List<HubAnalyticsDto.TabAnalytics> calculateTabAnalytics(User user, Instant since) {
        List<Map<String, Object>> aggregatedData = tabUsageRepository.aggregateUsageByUserAndTimestampAfter(user,
                since);

        // Group by mapped display name to be extra safe
        Map<String, Long> groupedDurations = new HashMap<>();
        for (Map<String, Object> data : aggregatedData) {
            String tabName = (String) data.get("tabName");
            if (tabName == null)
                tabName = "unknown";

            String displayName = TAB_DISPLAY_NAMES.getOrDefault(tabName.toLowerCase(), capitalize(tabName));
            Object durationObj = data.get("totalDuration");
            long duration = durationObj instanceof Number ? ((Number) durationObj).longValue() : 0L;

            groupedDurations.put(displayName, groupedDurations.getOrDefault(displayName, 0L) + duration);
        }

        long totalDuration = groupedDurations.values().stream().mapToLong(Long::longValue).sum();

        if (totalDuration == 0) {
            return getDefaultTabAnalytics();
        }

        // Get session counts (also grouped by display name)
        Map<String, Long> mappedSessionCounts = new HashMap<>();
        List<TabUsage> usages = tabUsageRepository.findByUserAndTimestampAfter(user, since);
        for (TabUsage u : usages) {
            String tabName = u.getTabName() != null ? u.getTabName().toLowerCase() : "unknown";
            String displayName = TAB_DISPLAY_NAMES.getOrDefault(tabName, capitalize(tabName));
            mappedSessionCounts.put(displayName, mappedSessionCounts.getOrDefault(displayName, 0L) + 1);
        }

        List<HubAnalyticsDto.TabAnalytics> tabAnalyticsList = new ArrayList<>();

        for (Map.Entry<String, Long> entry : groupedDurations.entrySet()) {
            String displayName = entry.getKey();
            long duration = entry.getValue();
            String originalKey = displayName.toLowerCase();

            int percentage = (int) ((duration * 100) / totalDuration);
            int sessions = mappedSessionCounts.getOrDefault(displayName, 0L).intValue();

            HubAnalyticsDto.TabAnalytics tabAnalytics = new HubAnalyticsDto.TabAnalytics(
                    displayName,
                    percentage,
                    TAB_COLORS.getOrDefault(originalKey, "#64748b"),
                    TAB_ICONS.getOrDefault(originalKey, "apps"),
                    sessions,
                    duration);

            tabAnalyticsList.add(tabAnalytics);
        }

        // Sort by percentage descending
        tabAnalyticsList.sort((a, b) -> Integer.compare(b.getPercentage(), a.getPercentage()));

        return tabAnalyticsList;
    }

    private List<Integer> calculateActivityTrend(User user, String timeframe) {
        Instant since;

        String mode = timeframe.toLowerCase();
        if ("yearly".equals(mode)) {
            since = Instant.now().minus(365, ChronoUnit.DAYS);
        } else if ("monthly".equals(mode)) {
            since = Instant.now().minus(28, ChronoUnit.DAYS);
        } else {
            // Daily or Weekly default to last 7 days daily view
            since = Instant.now().minus(7, ChronoUnit.DAYS);
        }

        List<TabUsage> usages = tabUsageRepository.findByUserAndTimestampAfter(user, since);
        List<Integer> activity = new ArrayList<>();
        LocalDate today = LocalDate.now();

        if ("yearly".equals(mode)) {
            // Group by Month
            Map<Integer, Long> monthlyDurations = usages.stream()
                    .filter(u -> u.getTimestamp() != null)
                    .collect(Collectors.groupingBy(
                            u -> u.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate().getMonthValue(),
                            Collectors.summingLong(u -> u.getDurationSeconds() != null ? u.getDurationSeconds() : 0L)));

            // Last 12 months (relative to now)
            for (int i = 11; i >= 0; i--) {
                LocalDate monthDate = today.minusMonths(i);
                int monthValue = monthDate.getMonthValue();
                long seconds = monthlyDurations.getOrDefault(monthValue, 0L);
                activity.add((int) (seconds / 60));
            }
        } else if ("monthly".equals(mode)) {
            // Group by Week (approx 4 weeks)
            Map<Integer, Long> dailyDurations = usages.stream()
                    .filter(u -> u.getTimestamp() != null)
                    .collect(Collectors.groupingBy(
                            u -> u.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate().getDayOfYear(),
                            Collectors.summingLong(u -> u.getDurationSeconds() != null ? u.getDurationSeconds() : 0L)));

            // Aggregate into 4 weeks
            for (int w = 3; w >= 0; w--) {
                long weekSum = 0;
                // Sum 7 days
                for (int d = 0; d < 7; d++) {
                    LocalDate date = today.minusDays(w * 7 + d);
                    weekSum += dailyDurations.getOrDefault(date.getDayOfYear(), 0L);
                }
                activity.add((int) (weekSum / 60));
            }
        } else {
            // Daily/Weekly - Group by Day (Last 7 Days)
            Map<LocalDate, Long> dailyDurations = usages.stream()
                    .filter(u -> u.getTimestamp() != null)
                    .collect(Collectors.groupingBy(
                            usage -> usage.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate(),
                            Collectors.summingLong(u -> u.getDurationSeconds() != null ? u.getDurationSeconds() : 0L)));

            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                long seconds = dailyDurations.getOrDefault(date, 0L);
                activity.add((int) (seconds / 60));
            }
        }

        return activity;
    }

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
                .filter(u -> u.getTimestamp() != null)
                .map(usage -> usage.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toSet());
        // Cap consistency at 100% of daysInPeriod
        double consistencyRatio = Math.min(1.0, activeDays.size() / (double) daysInPeriod);
        int consistencyScore = (int) (consistencyRatio * 30);

        // Factor 3: Total engagement time (30%)
        // Target: 1 hour per day average = max score
        long totalSeconds = usages.stream().mapToLong(u -> u.getDurationSeconds() != null ? u.getDurationSeconds() : 0L)
                .sum();
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

    public Map<String, Long> getRegistrationStats() {
        List<User> users = userRepository.findAll();
        Map<String, Long> stats = new HashMap<>();
        stats.put("web", users.stream().filter(u -> "web".equals(u.getRegistrationSource())).count());
        stats.put("mobile", users.stream().filter(u -> "mobile".equals(u.getRegistrationSource())).count());
        stats.put("unknown", users.stream().filter(u -> u.getRegistrationSource() == null).count());
        return stats;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}

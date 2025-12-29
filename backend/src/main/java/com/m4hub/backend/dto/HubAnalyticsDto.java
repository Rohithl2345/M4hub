package com.m4hub.backend.dto;

import java.util.List;

public class HubAnalyticsDto {
    private List<TabAnalytics> tabAnalytics;
    private List<Integer> weeklyActivity;
    private EngagementMetrics engagementMetrics;

    public static class TabAnalytics {
        private String name;
        private int percentage;
        private String color;
        private String icon;
        private int sessions;
        private long totalSeconds;

        public TabAnalytics() {
        }

        public TabAnalytics(String name, int percentage, String color, String icon, int sessions, long totalSeconds) {
            this.name = name;
            this.percentage = percentage;
            this.color = color;
            this.icon = icon;
            this.sessions = sessions;
            this.totalSeconds = totalSeconds;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getPercentage() {
            return percentage;
        }

        public void setPercentage(int percentage) {
            this.percentage = percentage;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public int getSessions() {
            return sessions;
        }

        public void setSessions(int sessions) {
            this.sessions = sessions;
        }

        public long getTotalSeconds() {
            return totalSeconds;
        }

        public void setTotalSeconds(long totalSeconds) {
            this.totalSeconds = totalSeconds;
        }
    }

    public static class EngagementMetrics {
        private String dailyActiveTime;
        private String featuresUsed;
        private String engagementScore;
        private String dailyChange;
        private String featuresChange;
        private String scoreChange;

        public EngagementMetrics() {
        }

        // Getters and Setters
        public String getDailyActiveTime() {
            return dailyActiveTime;
        }

        public void setDailyActiveTime(String dailyActiveTime) {
            this.dailyActiveTime = dailyActiveTime;
        }

        public String getFeaturesUsed() {
            return featuresUsed;
        }

        public void setFeaturesUsed(String featuresUsed) {
            this.featuresUsed = featuresUsed;
        }

        public String getEngagementScore() {
            return engagementScore;
        }

        public void setEngagementScore(String engagementScore) {
            this.engagementScore = engagementScore;
        }

        public String getDailyChange() {
            return dailyChange;
        }

        public void setDailyChange(String dailyChange) {
            this.dailyChange = dailyChange;
        }

        public String getFeaturesChange() {
            return featuresChange;
        }

        public void setFeaturesChange(String featuresChange) {
            this.featuresChange = featuresChange;
        }

        public String getScoreChange() {
            return scoreChange;
        }

        public void setScoreChange(String scoreChange) {
            this.scoreChange = scoreChange;
        }
    }

    public HubAnalyticsDto() {
    }

    // Getters and Setters
    public List<TabAnalytics> getTabAnalytics() {
        return tabAnalytics;
    }

    public void setTabAnalytics(List<TabAnalytics> tabAnalytics) {
        this.tabAnalytics = tabAnalytics;
    }

    public List<Integer> getWeeklyActivity() {
        return weeklyActivity;
    }

    public void setWeeklyActivity(List<Integer> weeklyActivity) {
        this.weeklyActivity = weeklyActivity;
    }

    public EngagementMetrics getEngagementMetrics() {
        return engagementMetrics;
    }

    public void setEngagementMetrics(EngagementMetrics engagementMetrics) {
        this.engagementMetrics = engagementMetrics;
    }
}

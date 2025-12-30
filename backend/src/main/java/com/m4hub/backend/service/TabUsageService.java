package com.m4hub.backend.service;

import com.m4hub.backend.model.TabUsage;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.TabUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class TabUsageService {

    @Autowired
    private TabUsageRepository tabUsageRepository;

    public void logUsage(User user, String tabName, Long durationSeconds) {
        TabUsage usage = new TabUsage(user, tabName != null ? tabName.toLowerCase() : "unknown", durationSeconds);
        tabUsageRepository.save(usage);
    }

    public List<Map<String, Object>> getAnalytics(User user, String timeframe) {
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
        return tabUsageRepository.aggregateUsageByUserAndTimestampAfter(user, since);
    }
}

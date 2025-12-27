package com.m4hub.backend.controller;

import com.m4hub.backend.model.User;
import com.m4hub.backend.service.AuthService;
import com.m4hub.backend.service.TabUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private TabUsageService tabUsageService;

    @Autowired
    private AuthService authService;

    private User getUserFromToken(String authHeader) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            throw new RuntimeException("Invalid or expired session token");
        }
        return user;
    }

    @PostMapping("/log")
    public ResponseEntity<?> logUsage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromToken(authHeader);
            String tabName = (String) request.get("tabName");
            Long durationSeconds = Long.valueOf(request.get("durationSeconds").toString());

            tabUsageService.logUsage(user, tabName, durationSeconds);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/usage")
    public ResponseEntity<?> getUsage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "weekly") String timeframe) {
        try {
            User user = getUserFromToken(authHeader);
            List<Map<String, Object>> analytics = tabUsageService.getAnalytics(user, timeframe);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

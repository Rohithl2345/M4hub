package com.m4hub.backend.repository;

import com.m4hub.backend.model.TabUsage;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public interface TabUsageRepository extends JpaRepository<TabUsage, Long> {

    @Query("SELECT t FROM TabUsage t WHERE t.user = :user AND t.timestamp >= :since ORDER BY t.timestamp DESC")
    List<TabUsage> findByUserAndTimestampAfter(@Param("user") User user, @Param("since") Instant since);

    @Query("SELECT t.tabName as tabName, SUM(t.durationSeconds) as totalDuration " +
            "FROM TabUsage t WHERE t.user = :user AND t.timestamp >= :since " +
            "GROUP BY t.tabName")
    List<Map<String, Object>> aggregateUsageByUserAndTimestampAfter(@Param("user") User user,
            @Param("since") Instant since);
}

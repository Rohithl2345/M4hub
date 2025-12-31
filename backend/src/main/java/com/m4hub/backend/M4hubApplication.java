package com.m4hub.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@org.springframework.cache.annotation.EnableCaching
@org.springframework.scheduling.annotation.EnableAsync
public class M4hubApplication {
    public static void main(String[] args) {
        SpringApplication.run(M4hubApplication.class, args);
    }

    @Bean
    public org.springframework.core.task.TaskExecutor taskExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor executor = new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("M4HubAsync-");
        executor.initialize();
        return executor;
    }

    @Bean
    public CommandLineRunner runMigration(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Running manual database migration...");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_until TIMESTAMP");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(20)");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)");
                jdbcTemplate
                        .execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN DEFAULT FALSE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE");

                // Ensure existing rows have is_deleted set to false
                jdbcTemplate.execute("UPDATE users SET is_deleted = FALSE WHERE is_deleted IS NULL");
                jdbcTemplate.execute("UPDATE users SET has_seen_tutorial = FALSE WHERE has_seen_tutorial IS NULL");
                jdbcTemplate.execute("UPDATE users SET is_online = FALSE WHERE is_online IS NULL");

                // CRITICAL FIX: Set all users back to active (some were accidentally
                // deactivated by websocket startup code)
                jdbcTemplate.execute(
                        "UPDATE users SET is_active = TRUE WHERE is_active = FALSE AND is_deleted = FALSE AND deactivated_until IS NULL");

                System.out.println("Manual migration completed successfully.");
            } catch (Exception e) {
                System.err.println("Manual migration failed: " + e.getMessage());
            }
        };
    }
}

package com.m4hub.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DatabaseCleanup implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseCleanup.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseCleanup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking for erroneous unique constraint on bank_accounts(user_id)...");
        try {
            // Attempt to drop the unique constraint that prevents multiple accounts per
            // user.
            // Using generic SQL that works on Postgres.
            // The constraint name 'uk_hjyau5ide36kljwupsvnmj3cl' comes from the error log.
            jdbcTemplate.execute("ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS uk_hjyau5ide36kljwupsvnmj3cl");
            logger.info("Successfully dropped constraint 'uk_hjyau5ide36kljwupsvnmj3cl' if it existed.");
        } catch (Exception e) {
            logger.warn("Could not drop constraint (might not exist or different DB type): " + e.getMessage());
        }
    }
}

package com.m4hub.backend.component;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simulated Banking Gateway / UPI SDK
 * In a real production environment, this would integrate with NPCI (UPI)
 * or a Payment Gateway API (Razorpay, Stripe, etc.)
 */
@Component
public class BankingGateway {
    private static final Logger logger = LoggerFactory.getLogger(BankingGateway.class);

    /**
     * Simulates an external API call to authorize and execute a transfer
     * 
     * @return A transaction reference ID from the "Bank"
     */
    public String executeExternalTransfer(String fromAccount, String toAccount, BigDecimal amount) {
        logger.info("Initiating external bank transfer: {} -> {} for amount {}", fromAccount, toAccount, amount);

        // Simulating network latency of a real SDK/API call
        try {
            Thread.sleep(800);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Logic check: Any amount > 100,000 might be flagged/fail in a real scenario
        if (amount.compareTo(new BigDecimal("100000.00")) > 0) {
            logger.error("Transfer rejected by External Bank: Amount exceeds limit");
            throw new RuntimeException("External Banking Error: Transaction limit exceeded");
        }

        String bankRefId = "BNK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        logger.info("External bank transfer successful. Ref: {}", bankRefId);

        return bankRefId;
    }

    /**
     * Simulates verifying a UPI PIN with an external banking server
     */
    public boolean verifyPinExternally(String hashedPin, String inputPin) {
        // In a real UPI SDK, the PIN is never even seen by the merchant app.
        // It's entered in a secure overlay provided by the Bank/NPCI.
        // Here we simulate the validation success.
        return true;
    }

    /**
     * Simulates verifying bank account details with external banking API
     * In production, this would call NPCI or bank's verification API
     * 
     * @return true if account is valid and verified
     */
    public boolean verifyBankAccount(String accountNumber, String ifscCode, String accountHolderName) {
        logger.info("Verifying bank account: {} with IFSC: {}", accountNumber, ifscCode);

        // Simulate API call latency
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Basic validation checks (in production, this would be done by bank API)
        if (accountNumber == null || accountNumber.length() < 9 || accountNumber.length() > 18) {
            logger.warn("Invalid account number length");
            return false;
        }

        if (ifscCode == null || ifscCode.length() != 11) {
            logger.warn("Invalid IFSC code format");
            return false;
        }

        if (accountHolderName == null || accountHolderName.trim().isEmpty()) {
            logger.warn("Account holder name is required");
            return false;
        }

        logger.info("Bank account verification successful");
        return true; // Simulate successful verification
    }

    /**
     * Simulates fetching the current balance from the external bank
     * Generates a deterministic "random" balance based on account number hash
     */
    public BigDecimal getMockBalance(String accountNumber) {
        if (accountNumber == null || accountNumber.isEmpty())
            return new BigDecimal("5000.00");

        long hash = Math.abs(accountNumber.hashCode());
        // Generate a value between 1,000 and 50,000
        long value = 1000 + (hash % 49000);
        return new BigDecimal(value + ".00");
    }
}

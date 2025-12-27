package com.m4hub.backend.service;

import com.m4hub.backend.model.BankAccount;
import com.m4hub.backend.model.Transaction;
import com.m4hub.backend.model.User;
import com.m4hub.backend.repository.BankAccountRepository;
import com.m4hub.backend.repository.TransactionRepository;
import com.m4hub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.m4hub.backend.component.BankingGateway bankingGateway;

    /**
     * Securely hash the UPI PIN using SHA-256 (matches AuthService logic)
     */
    private String hashPin(String pin) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(pin.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Security error while protecting PIN", e);
        }
    }

    public Optional<BankAccount> getBankAccount(User user) {
        return bankAccountRepository.findByUser(user);
    }

    @Transactional
    public BankAccount linkBankAccount(User user, String accountNumber, String bankName,
            String ifscCode, String accountHolderName, String upiPin) {
        BankAccount account = bankAccountRepository.findByUser(user).orElse(new BankAccount());
        account.setUser(user);
        account.setAccountNumber(accountNumber);
        account.setBankName(bankName);
        account.setIfscCode(ifscCode.toUpperCase());
        account.setAccountHolderName(accountHolderName);

        // PRODUCTION: Call Banking Gateway to verify account details
        boolean isVerified = bankingGateway.verifyBankAccount(accountNumber, ifscCode, accountHolderName);
        account.setIsVerified(isVerified);

        if (!isVerified) {
            throw new RuntimeException("Bank account verification failed. Please check your details.");
        }

        // PRODUCTION UPDATE: Hash the PIN before saving
        account.setUpiPin(hashPin(upiPin));

        // Always sync the latest balance from the external bank verification
        account.setBalance(bankingGateway.getMockBalance(accountNumber));
        return bankAccountRepository.save(account);
    }

    @Transactional
    public Transaction transferMoney(User sender, Long receiverId, BigDecimal amount, String upiPin,
            String description) {
        BankAccount senderAccount = bankAccountRepository.findByUser(sender)
                .orElseThrow(() -> new RuntimeException("Your bank account is not linked."));

        // VERIFICATION: Check if sender's account is verified
        if (!senderAccount.getIsVerified()) {
            throw new RuntimeException("Your bank account is not verified. Please re-link your account.");
        }

        // PRODUCTION UPDATE: Verify hashed PIN
        String hashedInput = hashPin(upiPin);
        if (!senderAccount.getUpiPin().equals(hashedInput)) {
            throw new RuntimeException("Incorrect UPI PIN. Please try again.");
        }

        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds in your account.");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Recipient not found."));

        BankAccount receiverAccount = bankAccountRepository.findByUser(receiver)
                .orElseThrow(() -> new RuntimeException("Recipient does not have a linked bank account."));

        // VERIFICATION: Check if receiver's account is verified
        if (!receiverAccount.getIsVerified()) {
            throw new RuntimeException("Recipient's bank account is not verified. Transfer cannot proceed.");
        }

        // CORE INTEGRATION: Call the external Banking Gateway
        String externalRefId = bankingGateway.executeExternalTransfer(
                senderAccount.getAccountNumber(),
                receiverAccount.getAccountNumber(),
                amount);

        // Atomically update balances locally (reflecting the successful external
        // transfer)
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        receiverAccount.setBalance(receiverAccount.getBalance().add(amount));

        bankAccountRepository.save(senderAccount);
        bankAccountRepository.save(receiverAccount);

        // Record transaction with the External Reference
        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(receiver);
        transaction.setAmount(amount);
        transaction.setDescription(description + " (Ref: " + externalRefId + ")");
        transaction.setStatus("SUCCESS");
        transaction.setTimestamp(Instant.now());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction transferToAccount(User sender, String recipientName, String accountNumber, String ifsc,
            BigDecimal amount, String upiPin, String description) {
        BankAccount senderAccount = bankAccountRepository.findByUser(sender)
                .orElseThrow(() -> new RuntimeException("Your bank account is not linked."));

        if (!senderAccount.getIsVerified()) {
            throw new RuntimeException("Your bank account is not verified.");
        }

        // Verify PIN
        String hashedInput = hashPin(upiPin);
        if (!senderAccount.getUpiPin().equals(hashedInput)) {
            throw new RuntimeException("Incorrect UPI PIN.");
        }

        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds.");
        }

        // Verify Beneficiary via Gateway
        boolean valid = bankingGateway.verifyBankAccount(accountNumber, ifsc, recipientName);
        if (!valid) {
            throw new RuntimeException("Beneficiary bank account verification failed.");
        }

        // Execute External Transfer
        String externalRefId = bankingGateway.executeExternalTransfer(
                senderAccount.getAccountNumber(),
                accountNumber,
                amount);

        // Deduct Balance
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        bankAccountRepository.save(senderAccount);

        // Record Transaction
        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(null); // External Transfer
        transaction.setAmount(amount);
        transaction.setDescription(
                "To: " + recipientName + " (" + accountNumber + ") - " + description + " Ref: " + externalRefId);
        transaction.setStatus("SUCCESS");
        transaction.setTimestamp(Instant.now());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionHistory(User user) {
        return transactionRepository.findBySenderOrReceiverOrderByTimestampDesc(user, user);
    }

    public Optional<User> findUserByPhone(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    @Transactional
    public BigDecimal checkBalance(User user, String upiPin) {
        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No bank account linked to this user."));

        // Verify PIN
        String hashedInput = hashPin(upiPin);
        if (!account.getUpiPin().equals(hashedInput)) {
            throw new RuntimeException("Incorrect UPI PIN. Please try again.");
        }

        // Fetch latest live balance from gateway
        BigDecimal liveBalance = bankingGateway.getMockBalance(account.getAccountNumber());

        // Update local cache
        account.setBalance(liveBalance);
        bankAccountRepository.save(account);

        return liveBalance;
    }

    public void resetAllMoneyData() {
        transactionRepository.deleteAll();
        bankAccountRepository.deleteAll();
    }
}

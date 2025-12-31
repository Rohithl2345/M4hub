package com.m4hub.backend.controller;

import com.m4hub.backend.model.BankAccount;
import com.m4hub.backend.model.Transaction;
import com.m4hub.backend.model.User;
import com.m4hub.backend.service.PaymentService;
import com.m4hub.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.m4hub.backend.constants.BankConstants;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private AuthService authService;

    private User getUserFromToken(String authHeader) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            throw new RuntimeException("Invalid or expired session token");
        }
        return user;
    }

    @GetMapping("/account")
    public ResponseEntity<?> getAccount(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            return paymentService.getBankAccount(user)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Authentication or session error. Please try again."));
        }
    }

    @PostMapping("/link")
    public ResponseEntity<?> linkAccount(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromToken(authHeader);
            String accountNumber = request.get("accountNumber");
            String bankName = request.get("bankName");
            String ifscCode = request.get("ifscCode");
            String accountHolderName = request.get("accountHolderName");
            String upiPin = request.get("upiPin");

            BankAccount account = paymentService.linkBankAccount(user, accountNumber, bankName,
                    ifscCode, accountHolderName, upiPin);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Transaction failed to initialize. Please try again later."));
        }
    }

    @GetMapping("/banks")
    public ResponseEntity<?> getSupportedBanks() {
        return ResponseEntity.ok(BankConstants.SUPPORTED_BANKS.stream()
                .map(bank -> {
                    Map<String, String> bankMap = new HashMap<>();
                    bankMap.put("code", bank.getCode());
                    bankMap.put("name", bank.getName());
                    bankMap.put("ifscPrefix", bank.getIfscPrefix());
                    return bankMap;
                })
                .collect(Collectors.toList()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromToken(authHeader);
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String upiPin = request.get("upiPin").toString();
            String description = request.getOrDefault("description", "").toString();

            Transaction tx = paymentService.transferMoney(user, receiverId, amount, upiPin, description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Transaction verification failed."));
        }
    }

    @PostMapping("/transfer-external")
    public ResponseEntity<?> transferExternal(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromToken(authHeader);
            String recipientName = request.get("recipientName").toString();
            String accountNumber = request.get("accountNumber").toString();
            String ifsc = request.get("ifsc").toString();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String upiPin = request.get("upiPin").toString();
            String description = request.getOrDefault("description", "").toString();

            Transaction tx = paymentService.transferToAccount(user, recipientName, accountNumber, ifsc, amount, upiPin,
                    description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Unable to list transactions."));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            return ResponseEntity.ok(paymentService.getTransactionHistory(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized access."));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUserByPhone(@RequestHeader("Authorization") String authHeader,
            @RequestParam String phone) {
        getUserFromToken(authHeader);
        return paymentService.findUserByPhone(phone)
                .map(u -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", u.getId());
                    response.put("name", u.getName());
                    response.put("username", u.getUsername());
                    response.put("phoneNumber", u.getPhoneNumber());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/check-balance")
    public ResponseEntity<?> checkBalance(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromToken(authHeader);
            String upiPin = request.get("upiPin");
            BigDecimal balance = paymentService.checkBalance(user, upiPin);
            Map<String, Object> response = new HashMap<>();
            response.put("balance", balance);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/reset")
    public ResponseEntity<?> resetMoneyData(@RequestHeader("Authorization") String authHeader) {
        getUserFromToken(authHeader); // Only authenticated users can reset (maybe should be admin only?)
        paymentService.resetAllMoneyData();
        return ResponseEntity.ok(Map.of("success", true, "message", "All money data reset successfully"));
    }
}

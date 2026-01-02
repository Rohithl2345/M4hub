package com.m4hub.backend.repository;

import com.m4hub.backend.model.BankAccount;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    java.util.List<BankAccount> findByUser(User user);

    Optional<BankAccount> findByUserAndIsPrimary(User user, Boolean isPrimary);

    Optional<BankAccount> findByAccountNumber(String accountNumber);
}

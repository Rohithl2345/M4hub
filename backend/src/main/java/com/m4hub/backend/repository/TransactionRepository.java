package com.m4hub.backend.repository;

import com.m4hub.backend.model.Transaction;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderOrderByTimestampDesc(User sender);

    List<Transaction> findByReceiverOrderByTimestampDesc(User receiver);

    List<Transaction> findBySenderOrReceiverOrderByTimestampDesc(User sender, User receiver);
}

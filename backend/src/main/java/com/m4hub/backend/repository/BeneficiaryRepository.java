package com.m4hub.backend.repository;

import com.m4hub.backend.model.Beneficiary;
import com.m4hub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUser(User user);
}

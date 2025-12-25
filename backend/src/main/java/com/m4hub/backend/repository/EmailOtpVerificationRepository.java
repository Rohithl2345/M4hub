package com.m4hub.backend.repository;

import com.m4hub.backend.model.EmailOtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface EmailOtpVerificationRepository extends JpaRepository<EmailOtpVerification, Long> {

    List<EmailOtpVerification> findByEmailAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(
            String email, String otpCode, Instant currentTime);

    void deleteByEmail(String email);
}

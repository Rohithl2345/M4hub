package com.m4hub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class M4hubApplication {
    public static void main(String[] args) {
        SpringApplication.run(M4hubApplication.class, args);
    }
}

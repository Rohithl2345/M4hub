package com.m4hub.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        logger.error("Unhandled exception occurred: ", ex);
        return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "An unexpected error occurred",
                "error", ex.getMessage() != null ? ex.getMessage() : "Unknown error"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception occurred: ", ex);
        return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<?> handleDataAccessException(org.springframework.dao.DataAccessException ex) {
        logger.error("Database error occurred: ", ex);
        return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Database error occurred",
                "error", ex.getMostSpecificCause().getMessage()));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        logger.error("Validation error occurred: {}", ex.getMessage());
        java.util.Map<String, String> errors = new java.util.HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", "Validation failed",
                "errors", errors));
    }
}

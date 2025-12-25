package com.m4hub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(FileController.class);

    private final Path fileStorageLocation;

    public FileController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        logger.info("Received file upload request: {}", file.getOriginalFilename());
        try {
            // Clean the file name
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null)
                originalFileName = "file";
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Assuming the server is running on the same host, we just return the relative
            // path
            // The frontend will prepend the base API URL
            String fileDownloadUri = "/uploads/" + fileName;

            logger.info("File uploaded successfully: {}", fileDownloadUri);
            return ResponseEntity
                    .ok(Map.of("url", fileDownloadUri, "fileName", fileName, "type", file.getContentType()));
        } catch (IOException ex) {
            logger.error("Could not upload file", ex);
            return ResponseEntity.badRequest().body(Map.of("message", "Could not upload file " + ex.getMessage()));
        }
    }
}

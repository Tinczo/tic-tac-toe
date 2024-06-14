package com.tictactoe.controller;

import com.tictactoe.model.Status;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/upload")
@CrossOrigin("*")
public class PictureUploadController {
    private final S3Client s3Client;

    @PostMapping("/picture")
    public ResponseEntity<Status> picture(@RequestParam("file") MultipartFile file) {
        Status status = new Status();
        status.setOk(false);

        try {
            String key = file.getOriginalFilename();


            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
    //              .bucket(System.getenv("S3_BUCKET_NAME"))  // TODO:
                    .bucket("tic-tac-toe-266586")
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));

            status.setOk(true);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error uploading file to S3", e);
            return ResponseEntity.status(500).body(status);
        }
    }
}

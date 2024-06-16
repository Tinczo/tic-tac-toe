package com.tictactoe.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.SnsException;
import software.amazon.awssdk.services.sns.model.SubscribeRequest;
import software.amazon.awssdk.services.sns.model.SubscribeResponse;

import java.util.Map;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/sns")
@CrossOrigin("*")
public class snsController {

    private final SnsClient snsClient;

    @PostMapping("/subscribe")
    public ResponseEntity<?> snsSubscribe(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        SubscribeRequest request = SubscribeRequest.builder()
                .protocol("email")
                .endpoint(email)
                .returnSubscriptionArn(true)
//                .topicArn("arn:aws:sns:us-east-1:058264135276:game-updates")
                .topicArn(System.getenv("REACT_APP_SNS_TOPIC_ARN")) //TODO:
                .build();

        try {
            SubscribeResponse response = snsClient.subscribe(request);
            response.subscriptionArn();
        } catch (SnsException e) {
//            System.err.println(e.awsErrorDetails().errorMessage());
        }

        return ResponseEntity.ok("Subscribed to SNS successfully");
    }

}

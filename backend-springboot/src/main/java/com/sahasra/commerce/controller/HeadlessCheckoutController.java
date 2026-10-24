package com.sahasra.commerce.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/checkout")
@CrossOrigin(origins = "*")
public class HeadlessCheckoutController {

    @Value("${sahasra.stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping("/webhook/stripe")
    public ResponseEntity<Map<String, Object>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            if ("payment_intent.succeeded".equals(event.getType())) {
                // Commit stock reservation and dispatch Shiprocket fulfillment event
                return ResponseEntity.ok(Map.of(
                        "status", "COMMITTED",
                        "eventId", event.getId(),
                        "type", event.getType()
                ));
            }
            return ResponseEntity.ok(Map.of("status", "IGNORED", "type", event.getType()));
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid Stripe-Signature header"));
        }
    }
}

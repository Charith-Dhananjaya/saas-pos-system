package com.cdz.controller;

import com.cdz.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Billing endpoints for card payments via Stripe.
 */
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Stripe payment processing – PaymentIntents and Refunds")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/create-payment-intent")
    @Operation(summary = "Create a Stripe PaymentIntent", description = "Returns a clientSecret for Stripe.js confirmation. Body: { \"amountCents\": 1999 }")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Long> body) {
        Long amountCents = body != null ? body.get("amountCents") : null;
        if (amountCents == null || amountCents <= 0) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String clientSecret = billingService.createPaymentIntent(amountCents);
            return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to create payment intent"));
        }
    }

    @PostMapping("/refund")
    @Operation(summary = "Refund a card payment", description = "Body: { paymentIntentId, amountCents, reason? }")
    public ResponseEntity<Map<String, String>> refund(@RequestBody Map<String, Object> body) {
        String paymentIntentId = body != null && body.get("paymentIntentId") != null
                ? body.get("paymentIntentId").toString()
                : null;
        Number amountNum = body != null && body.get("amountCents") != null
                ? (Number) body.get("amountCents")
                : null;
        String reason = body != null && body.get("reason") != null
                ? body.get("reason").toString()
                : null;
        if (paymentIntentId == null || paymentIntentId.isBlank() || amountNum == null || amountNum.longValue() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "paymentIntentId and amountCents (positive) are required"));
        }
        long amountCents = amountNum.longValue();
        try {
            billingService.refundCardPayment(paymentIntentId, amountCents, reason);
            return ResponseEntity.ok(Map.of("message", "Refund initiated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Refund failed"));
        }
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook endpoint", description = "Receives Stripe event notifications")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        // TODO: Implement webhook verification and event handling
        return ResponseEntity.ok("Received");
    }
}

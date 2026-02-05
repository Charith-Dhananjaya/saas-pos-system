package com.cdz.controller;

import com.cdz.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Billing endpoints for card payments via Stripe.
 * - Create PaymentIntent: frontend gets clientSecret and confirms with Stripe.js.
 * - Refund: refund a card payment for an order.
 */
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    /**
     * Create a Stripe PaymentIntent for the given amount.
     * Body: { "amountCents": 1999 }  (e.g. 19.99 USD).
     * Returns: { "clientSecret": "pi_xxx_secret_yyy" } for use with Stripe.js.
     */
    @PostMapping("/create-payment-intent")
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

    /**
     * Refund a card payment.
     * Body: { "paymentIntentId": "pi_xxx", "amountCents": 1999, "reason": "requested_by_customer" }.
     * Reason is optional: duplicate | fraudulent | requested_by_customer.
     */
    @PostMapping("/refund")
    public ResponseEntity<Map<String, String>> refund(@RequestBody Map<String, Object> body) {
        String paymentIntentId = body != null && body.get("paymentIntentId") != null
                ? body.get("paymentIntentId").toString() : null;
        Number amountNum = body != null && body.get("amountCents") != null
                ? (Number) body.get("amountCents") : null;
        String reason = body != null && body.get("reason") != null
                ? body.get("reason").toString() : null;
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
}

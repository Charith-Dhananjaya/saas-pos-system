package com.cdz.service.impl;

import com.cdz.service.BillingService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.RefundCreateParams.Reason;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BillingServiceImpl implements BillingService {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${stripe.currency:usd}")
    private String currency;

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
            log.info("Stripe API key configured successfully");
        } else {
            log.warn("Stripe API key is not configured – card payments will be unavailable");
        }
    }

    @Override
    public String createPaymentIntent(long amountCents) throws Exception {
        ensureStripeConfigured();
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .build();
        PaymentIntent intent = PaymentIntent.create(params);
        return intent.getClientSecret();
    }

    @Override
    public boolean verifyPaymentSucceeded(String paymentIntentId) throws Exception {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            return false;
        }
        ensureStripeConfigured();
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        return "succeeded".equals(intent.getStatus());
    }

    @Override
    public void refundCardPayment(String paymentIntentId, long amountCents, String reason) throws Exception {
        ensureStripeConfigured();
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(amountCents);
        if (reason != null && !reason.isBlank()) {
            Reason r = "duplicate".equalsIgnoreCase(reason) ? Reason.DUPLICATE
                    : "fraudulent".equalsIgnoreCase(reason) ? Reason.FRAUDULENT
                            : Reason.REQUESTED_BY_CUSTOMER;
            paramsBuilder.setReason(r);
        }
        try {
            com.stripe.model.Refund.create(paramsBuilder.build());
        } catch (StripeException e) {
            log.error("Stripe refund failed: {}", e.getMessage());
            throw new Exception("Refund failed: " + e.getMessage());
        }
    }

    private void ensureStripeConfigured() {
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            throw new IllegalStateException(
                    "Stripe API key is not configured. Set STRIPE_API_KEY environment variable.");
        }
    }
}

package com.cdz.service;

/**
 * Billing (card/online payments) via Stripe.
 * Cash/UPI orders do not use this.
 */
public interface BillingService {

    /**
     * Create a Stripe PaymentIntent for the given amount (in smallest currency unit, e.g. cents).
     * Frontend uses clientSecret with Stripe.js to confirm payment.
     *
     * @param amountCents order total in cents (e.g. 1000 = 10.00 USD)
     * @return client secret for Stripe.js confirmCardPayment / confirmPayment
     */
    String createPaymentIntent(long amountCents) throws Exception;

    /**
     * Verify that a PaymentIntent has succeeded (status = succeeded).
     * Call before saving an order with paymentType CARD and this paymentIntentId.
     */
    boolean verifyPaymentSucceeded(String paymentIntentId) throws Exception;

    /**
     * Refund a card payment via Stripe. Use when refunding an order that was paid by CARD.
     *
     * @param paymentIntentId the order's stripePaymentIntentId
     * @param amountCents     amount to refund in cents (full or partial)
     * @param reason          optional reason (duplicate, fraudulent, requested_by_customer)
     */
    void refundCardPayment(String paymentIntentId, long amountCents, String reason) throws Exception;
}

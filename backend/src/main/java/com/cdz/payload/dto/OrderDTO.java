package com.cdz.payload.dto;

import com.cdz.domain.PaymentType;
import com.cdz.model.Customer;
import com.cdz.model.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDTO {

    private Long id;

    private Double totalAmount;
    private Double subtotal;
    private Double totalDiscount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long storeId;
    private Long customerId;

    private UserDto cashier;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("store")
    private Customer customer;

    private PaymentType paymentType;

    /**
     * When paymentType is CARD, set after Stripe confirms payment (for saving and
     * refunds).
     */
    private String stripePaymentIntentId;

    private List<OrderItemDTO> items;
}

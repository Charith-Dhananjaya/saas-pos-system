package com.cdz.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReceiptDTO {

    private Long orderId;
    private String receiptNumber;
    private LocalDateTime orderDate;

    // Store Information
    private String storeName;
    private String storeAddress;
    private String storePhone;

    // Cashier Information
    private String cashierName;

    // Customer Information (optional)
    private String customerName;
    private String customerPhone;

    // Order Items
    private List<ReceiptItemDTO> items;

    // Payment Details
    private String paymentType;
    private Double subtotal;
    private Double totalDiscount;
    private Double totalAmount;

    @Data
    @Builder
    public static class ReceiptItemDTO {
        private String productName;
        private String productSku;
        private Integer quantity;
        private Double originalPrice;
        private Double discountPercentage;
        private Double discountAmount;
        private Double finalPrice;
        private Double lineTotal;
    }
}

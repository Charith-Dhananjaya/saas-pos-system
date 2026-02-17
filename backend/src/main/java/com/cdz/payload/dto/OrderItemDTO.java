package com.cdz.payload.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemDTO {

    private Long id;

    private Integer quantity;

    private Double price;
    private Double originalPrice;
    private Double discountApplied;

    private ProductDTO product;

    private Long productId;

    private Long orderId;

}

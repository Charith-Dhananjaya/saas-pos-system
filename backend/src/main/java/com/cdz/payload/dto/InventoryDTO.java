package com.cdz.payload.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryDTO {

    private Long id;

    private ProductDTO product;

    private Long storeId;
    private Long productId;

    private Integer quantity;

    private LocalDateTime lastUpdate;
}

package com.cdz.payload.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryDTO {

    private Long id;

    private BranchDTO branch;

    private ProductDTO product;

    private Long branchId;
    private Long productId;

    private Integer quantity;

    private LocalDateTime lastUpdate;
}

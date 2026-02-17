package com.cdz.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemSalesReportDTO {

    private String productName;
    private String category;
    private Integer totalQuantitySold;
    private Double totalRevenue;
    private Integer numberOfOrders;
}

package com.cdz.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesReportDTO {

    private LocalDate date;
    private Integer totalOrders;
    private Double totalRevenue;
    private Double averageOrderValue;
}

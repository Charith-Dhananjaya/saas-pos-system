package com.cdz.mapper;

import com.cdz.model.Order;
import com.cdz.model.Product;
import com.cdz.model.Refund;
import com.cdz.model.ShiftReport;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.payload.dto.ProductDTO;
import com.cdz.payload.dto.RefundDTO;
import com.cdz.payload.dto.ShiftReportDTO;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ShiftReportMapper {

    public static ShiftReportDTO toDTO(ShiftReport entity) {
        if (entity == null) {
            return null;
        }

        return ShiftReportDTO.builder()
                .id(entity.getId())
                .shiftEnd(entity.getShiftEnd())
                .shiftStart(entity.getShiftStart())
                .totalSales(entity.getTotalSales())
                .totalRefunds(entity.getTotalRefunds())
                .netSales(entity.getNetSales())
                .totalOrders(entity.getTotalOrders())
                .cashier(UserMapper.toDTO(entity.getCashier()))
                .cashierId(entity.getCashier() != null ? entity.getCashier().getId() : null)
                .storeId(entity.getStore() != null ? entity.getStore().getId() : null)
                .recentOrders(mapOrders(entity.getRecentOrders()))
                .topSellingProducts(mapProducts(entity.getTopSellingProducts()))
                .refunds(mapRefunds(entity.getRefunds()))
                .paymentSummaries(entity.getPaymentSummaries())
                .build();
    }


    private static List<OrderDTO> mapOrders(List<Order> recentOrders) {
        if(recentOrders == null || recentOrders.isEmpty()) {return null;}
        return recentOrders.stream().map(OrderMapper::toDTO).collect(Collectors.toList());
    }

    private static List<ProductDTO> mapProducts(List<Product> topSellingProducts) {
        if(topSellingProducts == null || topSellingProducts.isEmpty()) {return null;}
        return topSellingProducts.stream().map(ProductMapper::toDTO).collect(Collectors.toList());
    }

    private static List<RefundDTO> mapRefunds(List<Refund> refunds) {
        if(refunds == null || refunds.isEmpty()) {return null;}
        return refunds.stream().map(RefundMapper::toDTO).collect(Collectors.toList());
    }
}


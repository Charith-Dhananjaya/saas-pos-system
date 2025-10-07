//package com.cdz.mapper;
//
//import com.cdz.model.Order;
//import com.cdz.payload.dto.OrderDTO;
//
//import java.util.stream.Collectors;
//
//public class OrderMapper {
//
//    public static OrderDTO toDTO(Order order) {
//
//        return OrderDTO.builder()
//                .id(order.getId())
//                .totalAmount(order.getTotalAmount())
//                .branchId(order.getBranch().getId())
//                .customerId(order.getCustomer().getId())
//                .cashier(UserMapper.toDTO(order.getCashier()))
//                .customer(order.getCustomer())
//                .branch(order.getBranch() != null ? BranchMapper.toDTO(order.getBranch()) : null)
//                .paymentType(order.getPaymentType())
//                .createdAt(order.getCreatedAt())
//                .updatedAt(order.getUpdatedAt())
//                .items(order.getItems().stream()
//                        .map(OrderItemMapper:: toDTO)
//                        .collect(Collectors.toList()))
//                .build();
//    }
//}

package com.cdz.mapper;

import com.cdz.model.Order;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.payload.dto.OrderItemDTO;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDTO(Order order) {
        if (order == null) {
            return null;
        }


        Long branchId = (order.getBranch() != null) ? order.getBranch().getId() : null;
        Long customerId = (order.getCustomer() != null) ? order.getCustomer().getId() : null;


        var cashierDto = (order.getCashier() != null) ? UserMapper.toDTO(order.getCashier()) : null;
        var branchDto  = (order.getBranch()  != null) ? BranchMapper.toDTO(order.getBranch()) : null;


        var itemDTOs = (order.getItems() != null)
                ? order.getItems().stream()
                .filter(Objects::nonNull)
                .map(OrderItemMapper::toDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return OrderDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .branchId(branchId)
                .customerId(customerId)
                .cashier(cashierDto)
                .branch(branchDto)
                .customer(order.getCustomer())

                .paymentType(order.getPaymentType())
                .items((List<OrderItemDTO>) itemDTOs)
                .build();
    }
}

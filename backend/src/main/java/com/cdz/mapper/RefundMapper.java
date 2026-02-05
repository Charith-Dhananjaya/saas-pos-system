package com.cdz.mapper;

import com.cdz.model.Refund;
import com.cdz.payload.dto.RefundDTO;

public class RefundMapper {

    public static RefundDTO toDTO(Refund refund) {
        return RefundDTO.builder()
                .id(refund.getId())
                .orderId(refund.getOrder() != null ? refund.getOrder().getId() : null)
                .reason(refund.getReason())
                .amount(refund.getAmount())
                .order(OrderMapper.toDTO(refund.getOrder()))
                .cashierName(refund.getCashier() != null ? refund.getCashier().getFullName() : null)
                .storeId(refund.getStore() != null ? refund.getStore().getId() : null)
                .shiftReportId(refund.getShiftReport() != null ? refund.getShiftReport().getId() : null)
                .paymentType(refund.getPaymentType())
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .build();
    }
}

package com.cdz.payload.dto;

import com.cdz.domain.PaymentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RefundDTO {

    private Long id;

    private OrderDTO order;
    private Long orderId;

    private String  reason;

    private Double  amount;


//    private ShiftReport shiftReport;
    private Long shiftReportId;


    private UserDto cashier;
    private String cashierName;

    private Long storeId;

    private PaymentType paymentType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}

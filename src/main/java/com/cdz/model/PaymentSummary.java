package com.cdz.model;

import com.cdz.domain.PaymentType;
import lombok.Data;

@Data
public class PaymentSummary {

    private PaymentType Type;
    private Double totalAmount;
    private int transactionCount;
    private double percentage;
}

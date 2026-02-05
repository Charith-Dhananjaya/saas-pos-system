package com.cdz.service.impl;

import com.cdz.mapper.RefundMapper;
import com.cdz.model.Order;
import com.cdz.model.Refund;
import com.cdz.model.Store;
import com.cdz.model.User;
import com.cdz.payload.dto.RefundDTO;
import com.cdz.repository.OrderRepository;
import com.cdz.repository.RefundRepository;
import com.cdz.service.BillingService;
import com.cdz.service.RefundService;
import com.cdz.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final UserService userService;
    private final OrderRepository orderRepository;
    private final BillingService billingService;

    @Override
    public RefundDTO createRefund(RefundDTO refund) throws Exception {

        Order order = orderRepository.findById(refund.getOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + refund.getOrderId()));

        Store store = order.getStore();
        if (store == null) {
            throw new EntityNotFoundException("Order has no store");
        }

        User cashier = userService.getCurrentUser();

        // If order was paid by card via Stripe, process refund through Stripe first
        if (order.getPaymentType() == com.cdz.domain.PaymentType.CARD
                && order.getStripePaymentIntentId() != null
                && !order.getStripePaymentIntentId().isBlank()
                && refund.getAmount() != null
                && refund.getAmount() > 0) {
            long amountCents = Math.round(refund.getAmount() * 100);
            if (amountCents > 0) {
                billingService.refundCardPayment(
                        order.getStripePaymentIntentId(),
                        amountCents,
                        refund.getReason()
                );
            }
        }

        Refund refunds = Refund.builder()
                .order(order)
                .store(store)
                .cashier(cashier)
                .reason(refund.getReason())
                .amount(refund.getAmount())
                .paymentType(order.getPaymentType())
                .build();

        Refund saved = refundRepository.save(refunds);
        return RefundMapper.toDTO(saved);
    }

    @Override
    public List<RefundDTO> getAllRefunds() throws Exception {
        return refundRepository.findAll().stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefundDTO> getRefundByCashier(Long cashierId) throws Exception {
        return refundRepository.findByCashierId(cashierId).stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<RefundDTO>  getRefundByShiftReport(Long shiftReportId) throws Exception {

        return refundRepository.findByShiftReportId(shiftReportId).stream()
                .map(RefundMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<RefundDTO> getRefundByCashierAndDateRange(Long cashierId, LocalDateTime startDate, LocalDateTime endDate)
            throws Exception {

    return refundRepository.findByCashierIdAndCreatedAtBetween(
            cashierId, startDate, endDate
    ).stream().map(RefundMapper::toDTO)
            .collect(Collectors.toList());

    }

    @Override
    public List<RefundDTO> getRefundByStore(Long storeId) throws Exception {
        return refundRepository.findByStoreId(storeId).stream().map(RefundMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RefundDTO getRefundById(Long refundId) throws Exception {
        return refundRepository.findById(refundId).map(RefundMapper::toDTO).orElseThrow(
                ()-> new Exception("Refund Not Found")
        );
    }

    @Override
    public void deleteRefund(Long refundId) throws Exception {

        this.getRefundById(refundId);
        refundRepository.deleteById(refundId);
    }
}

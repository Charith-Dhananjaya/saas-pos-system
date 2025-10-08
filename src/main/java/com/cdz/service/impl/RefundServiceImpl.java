package com.cdz.service.impl;

import com.cdz.mapper.RefundMapper;
import com.cdz.model.Branch;
import com.cdz.model.Order;
import com.cdz.model.Refund;
import com.cdz.model.User;
import com.cdz.payload.dto.RefundDTO;
import com.cdz.repository.BranchRepository;
import com.cdz.repository.OrderRepository;
import com.cdz.repository.RefundRepository;
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
    private final BranchRepository branchRepository;

    @Override
    public RefundDTO createRefund(RefundDTO refund) throws Exception {

        Order order = orderRepository.findById(refund.getOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + refund.getOrderId()));


        Branch branch = (refund.getBranchId() != null)
                ? branchRepository.findById(refund.getBranchId())
                .orElseThrow(() -> new EntityNotFoundException("Branch not found: " + refund.getBranchId()))
                : order.getBranch();

        User cashier = userService.getCurrentUser();

        Refund refunds = Refund.builder()
                .order(order)
                .branch(branch)
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
    public List<RefundDTO> getRefundByBranch(Long branchId) throws Exception {
        return refundRepository.findByBranchId(branchId).stream().map(RefundMapper::toDTO)
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

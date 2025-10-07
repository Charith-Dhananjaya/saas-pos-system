package com.cdz.service;

import com.cdz.domain.OrderStatus;
import com.cdz.domain.PaymentType;
import com.cdz.payload.dto.OrderDTO;

import java.util.List;

public interface OrderService {

    OrderDTO createOrder(OrderDTO orderDTO) throws Exception;

    OrderDTO updateOrder(Long id, OrderDTO orderDTO) throws Exception;

    OrderDTO getOrderById(Long id) throws Exception;

    List<OrderDTO> getOrdersByBranch(Long branchId,
                                     Long customerId,
                                     Long cashierId,
                                     PaymentType paymentType,
                                     OrderStatus orderStatus) throws Exception;

    List<OrderDTO> getOrdersByCashier(Long cashierId);

    void deleteOrder(Long id) throws Exception;

    List<OrderDTO> getOrdersByCustomerId(Long customerId) throws Exception;

    List<OrderDTO> getTodayOrdersByBranch(Long branchId) throws Exception;

    List<OrderDTO> getTop5RecentOrdersByBranchId(Long branchId) throws Exception;

}

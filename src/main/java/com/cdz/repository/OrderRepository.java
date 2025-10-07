package com.cdz.repository;

import com.cdz.model.Order;
import com.cdz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);
    List<Order> findByBranchId(Long branchId);
    List<Order> findByCashierId(Long cashierId);
    List<Order> findByBranchIdAndCreatedAtBetween(Long branchId,
                                                  LocalDateTime from, LocalDateTime to);
    List<Order> findByCashierAndCreatedAtBetween(User cashierId,
                                                       LocalDateTime from, LocalDateTime to);

    List<Order> findTop5ByBranchIdOrderByCreatedAtDesc(Long branchId);
}

package com.cdz.repository;

import com.cdz.model.Order;
import com.cdz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByStoreId(Long storeId);

    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<Order> findByCashierId(Long cashierId);

    List<Order> findByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime from, LocalDateTime to);

    List<Order> findByCashierAndCreatedAtBetween(User cashier, LocalDateTime from, LocalDateTime to);

    List<Order> findTop5ByStoreIdOrderByCreatedAtDesc(Long storeId);

    long countByStoreId(Long storeId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.store.id = :storeId")
    Double sumTotalAmountByStoreId(@org.springframework.data.repository.query.Param("storeId") Long storeId);
}

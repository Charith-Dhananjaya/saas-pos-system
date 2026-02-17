package com.cdz.repository;

import com.cdz.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.order.store.id = :storeId")
    Long sumQuantityByStoreId(Long storeId);
}

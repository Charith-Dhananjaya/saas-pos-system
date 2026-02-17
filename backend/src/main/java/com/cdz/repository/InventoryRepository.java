package com.cdz.repository;

import com.cdz.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Inventory findByProductIdAndStoreId(Long productId, Long storeId);

    List<Inventory> findByStoreId(Long storeId);

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantity <= i.lowStockThreshold")
    List<Inventory> findLowStockByStoreId(@Param("storeId") Long storeId);
}

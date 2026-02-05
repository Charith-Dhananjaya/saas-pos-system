package com.cdz.repository;

import com.cdz.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Inventory findByProductIdAndStoreId(Long productId, Long storeId);

    List<Inventory> findByStoreId(Long storeId);
}

package com.cdz.service;

import com.cdz.payload.dto.InventoryDTO;

import java.util.List;

public interface InventoryService {

    InventoryDTO createInventory(InventoryDTO inventoryDTO) throws Exception;

    InventoryDTO updateInventory(Long id, InventoryDTO inventoryDTO) throws Exception;

    void deleteInventory(Long id) throws Exception;

    InventoryDTO getInventoryById(Long id) throws Exception;

    InventoryDTO getInventoryByProductIdAndStoreId(Long productId, Long storeId);

    List<InventoryDTO> getInventoryByStoreId(Long storeId);
}

package com.cdz.mapper;

import com.cdz.model.Inventory;
import com.cdz.model.Product;
import com.cdz.model.Store;
import com.cdz.payload.dto.InventoryDTO;

public class InventoryMapper {

    public static InventoryDTO toDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .storeId(inventory.getStore() != null ? inventory.getStore().getId() : null)
                .productId(inventory.getProduct() != null ? inventory.getProduct().getId() : null)
                .product(inventory.getProduct() != null ? ProductMapper.toDTO(inventory.getProduct()) : null)
                .quantity(inventory.getQuantity())
                .build();
    }

    public static Inventory toEntity(InventoryDTO inventoryDTO, Store store, Product product) {
        return Inventory.builder()
                .store(store)
                .product(product)
                .quantity(inventoryDTO.getQuantity())
                .build();
    }
}

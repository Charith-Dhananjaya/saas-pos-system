package com.cdz.controller;

import com.cdz.payload.dto.InventoryDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventories")
@Tag(name = "Inventory", description = "Stock and inventory management")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Create an inventory record")
    public ResponseEntity<InventoryDTO> create(@RequestBody InventoryDTO inventoryDTO) throws Exception {
        return ResponseEntity.ok(inventoryService.createInventory(inventoryDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an inventory record")
    public ResponseEntity<InventoryDTO> update(
            @RequestBody InventoryDTO inventoryDTO,
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(inventoryService.updateInventory(id, inventoryDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inventory record")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) throws Exception {
        inventoryService.deleteInventory(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Inventory Deleted");
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get all inventory for a store")
    public ResponseEntity<List<InventoryDTO>> getInventoryByStoreId(@PathVariable Long storeId) {
        return ResponseEntity.ok(inventoryService.getInventoryByStoreId(storeId));
    }

    @GetMapping("/store/{storeId}/product/{productId}")
    @Operation(summary = "Get inventory by product and store")
    public ResponseEntity<InventoryDTO> getInventoryByProductIdAndStoreId(
            @PathVariable Long storeId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductIdAndStoreId(productId, storeId));
    }
}

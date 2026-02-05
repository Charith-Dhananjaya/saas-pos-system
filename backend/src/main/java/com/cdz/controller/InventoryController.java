package com.cdz.controller;

import com.cdz.payload.dto.InventoryDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventories")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping()
    public ResponseEntity<InventoryDTO> create(
            @RequestBody InventoryDTO inventoryDTO
    ) throws Exception {
        return ResponseEntity.ok(inventoryService.createInventory(inventoryDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> update(
            @RequestBody InventoryDTO inventoryDTO,
            @PathVariable Long id
    ) throws Exception {
        return ResponseEntity.ok(inventoryService.updateInventory(id, inventoryDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @PathVariable Long id
    ) throws Exception {
        inventoryService.deleteInventory(id);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Inventory Deleted");

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(
            @PathVariable Long id) throws Exception {

        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<InventoryDTO>> getInventoryByStoreId(@PathVariable Long storeId) {
        return ResponseEntity.ok(inventoryService.getInventoryByStoreId(storeId));
    }

    @GetMapping("/store/{storeId}/product/{productId}")
    public ResponseEntity<InventoryDTO> getInventoryByProductIdAndStoreId(
            @PathVariable Long storeId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductIdAndStoreId(productId, storeId));
    }

}

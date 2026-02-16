package com.cdz.controller;

import com.cdz.domain.StoreStatus;
import com.cdz.exceptions.UserException;
import com.cdz.mapper.StoreMapper;
import com.cdz.model.User;
import com.cdz.payload.dto.StoreDto;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.StoreService;
import com.cdz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/store")
@Tag(name = "Stores", description = "Store creation and management")
public class StoreController {

    private final StoreService storeService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new store")
    public ResponseEntity<StoreDto> createStore(@RequestBody StoreDto storeDto,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(storeService.createStore(storeDto, user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store by ID")
    public ResponseEntity<StoreDto> getStoreById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @GetMapping
    @Operation(summary = "Get all stores")
    public ResponseEntity<List<StoreDto>> getAllStore() {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @GetMapping("/admin")
    @Operation(summary = "Get store owned by current admin")
    public ResponseEntity<StoreDto> getStoreByAdmin() throws UserException {
        return ResponseEntity.ok(StoreMapper.toDTO(storeService.getStoreByAdmin()));
    }

    @GetMapping("/employee")
    @Operation(summary = "Get store the current employee belongs to")
    public ResponseEntity<StoreDto> getStoreByEmployee() throws UserException {
        return ResponseEntity.ok(storeService.getStoreByEmployee());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a store")
    public ResponseEntity<StoreDto> updateStore(@PathVariable Long id,
            @RequestBody StoreDto storeDto) throws Exception {
        return ResponseEntity.ok(storeService.updateStore(id, storeDto));
    }

    @PutMapping("/{id}/moderate")
    @Operation(summary = "Moderate store status", description = "Change store status (PENDING, ACTIVE, SUSPENDED)")
    public ResponseEntity<StoreDto> moderateStore(@PathVariable Long id,
            @RequestParam StoreStatus status) throws Exception {
        return ResponseEntity.ok(storeService.moderateStore(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a store")
    public ResponseEntity<ApiResponse> deleteStore(@PathVariable Long id) throws Exception {
        storeService.deleteStore(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Store deleted successfully");
        return ResponseEntity.ok(apiResponse);
    }
}

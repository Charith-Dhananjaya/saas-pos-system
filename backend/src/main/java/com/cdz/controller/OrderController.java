package com.cdz.controller;

import com.cdz.domain.OrderStatus;
import com.cdz.domain.PaymentType;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management and history")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO order) throws Exception {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get orders by store", description = "Filter by customer, cashier, payment type, or status")
    public ResponseEntity<List<OrderDTO>> getOrdersByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) OrderStatus orderStatus) throws Exception {
        return ResponseEntity
                .ok(orderService.getOrdersByStore(storeId, customerId, cashierId, paymentType, orderStatus));
    }

    @GetMapping("/today/store/{storeId}")
    @Operation(summary = "Get today's orders for a store")
    public ResponseEntity<List<OrderDTO>> getTodayOrdersByStore(@PathVariable Long storeId) throws Exception {
        return ResponseEntity.ok(orderService.getTodayOrdersByStore(storeId));
    }

    @GetMapping("/customer/{id}")
    @Operation(summary = "Get orders by customer ID")
    public ResponseEntity<List<OrderDTO>> getCustomersOrders(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(id));
    }

    @GetMapping("/recent/store/{storeId}")
    @Operation(summary = "Get 5 most recent orders for a store")
    public ResponseEntity<List<OrderDTO>> getRecentOrders(@PathVariable Long storeId) throws Exception {
        return ResponseEntity.ok(orderService.getTop5RecentOrdersByStoreId(storeId));
    }

    @GetMapping("/cashier/{id}")
    @Operation(summary = "Get orders by cashier ID")
    public ResponseEntity<List<OrderDTO>> getOrdersByCashier(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrdersByCashier(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an order")
    public ResponseEntity<OrderDTO> updateOrder(
            @PathVariable Long id,
            @RequestBody OrderDTO order) throws Exception {
        return ResponseEntity.ok(orderService.updateOrder(id, order));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an order")
    public ResponseEntity<ApiResponse> deleteOrder(@PathVariable Long id) throws Exception {
        orderService.deleteOrder(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Order Deleted");
        return ResponseEntity.ok(apiResponse);
    }
}

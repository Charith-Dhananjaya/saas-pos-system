package com.cdz.controller;

import com.cdz.domain.OrderStatus;
import com.cdz.domain.PaymentType;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {


    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @RequestBody OrderDTO order
    ) throws Exception {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id
    ) throws Exception {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) OrderStatus orderStatus
    ) throws Exception {
        return ResponseEntity.ok(
                orderService.getOrdersByStore(storeId, customerId, cashierId, paymentType, orderStatus)
        );
    }

    @GetMapping("/today/store/{storeId}")
    public ResponseEntity<List<OrderDTO>> getTodayOrdersByStore(@PathVariable Long storeId) throws Exception {
        return ResponseEntity.ok(orderService.getTodayOrdersByStore(storeId));
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<OrderDTO>> getCustomersOrders(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(id));
    }

    @GetMapping("/recent/store/{storeId}")
    public ResponseEntity<List<OrderDTO>> getRecentOrders(@PathVariable Long storeId) throws Exception {
        return ResponseEntity.ok(orderService.getTop5RecentOrdersByStoreId(storeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteOrder(@PathVariable Long id) throws Exception {
        orderService.deleteOrder(id);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Order Deleted");

        return ResponseEntity.ok(apiResponse);
    }


    @GetMapping("/cashier/{id}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCashier(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrdersByCashier(id));
    }


    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(
            @PathVariable Long id,
            @RequestBody OrderDTO order
    ) throws Exception {
        return ResponseEntity.ok(orderService.updateOrder(id, order));
    }


}

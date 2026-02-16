package com.cdz.controller;

import com.cdz.payload.dto.RefundDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.RefundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/refunds")
@Tag(name = "Refunds", description = "Refund processing and history")
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    @Operation(summary = "Create a refund")
    public ResponseEntity<RefundDTO> createRefund(@RequestBody RefundDTO refundDTO) throws Exception {
        return ResponseEntity.ok(refundService.createRefund(refundDTO));
    }

    @GetMapping
    @Operation(summary = "Get all refunds")
    public ResponseEntity<List<RefundDTO>> getAllRefunds() throws Exception {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    @GetMapping("/cashier/{cashierId}")
    @Operation(summary = "Get refunds by cashier")
    public ResponseEntity<List<RefundDTO>> getRefundByCashier(@PathVariable Long cashierId) throws Exception {
        return ResponseEntity.ok(refundService.getRefundByCashier(cashierId));
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get refunds by store")
    public ResponseEntity<List<RefundDTO>> getRefundByStore(@PathVariable Long storeId) throws Exception {
        return ResponseEntity.ok(refundService.getRefundByStore(storeId));
    }

    @GetMapping("/shift/{shiftId}")
    @Operation(summary = "Get refunds by shift")
    public ResponseEntity<List<RefundDTO>> getRefundByShift(@PathVariable Long shiftId) throws Exception {
        return ResponseEntity.ok(refundService.getRefundByShiftReport(shiftId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get refund by ID")
    public ResponseEntity<RefundDTO> getRefundById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(refundService.getRefundById(id));
    }

    @GetMapping("/cashier/{cashierId}/range")
    @Operation(summary = "Get refunds by cashier and date range")
    public ResponseEntity<List<RefundDTO>> getRefundByCashierAndDateRange(
            @PathVariable Long cashierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) throws Exception {
        return ResponseEntity.ok(refundService.getRefundByCashierAndDateRange(cashierId, startDate, endDate));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a refund")
    public ResponseEntity<ApiResponse> deleteRefund(@PathVariable Long id) throws Exception {
        refundService.deleteRefund(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Refund Deleted");
        return ResponseEntity.ok(apiResponse);
    }
}

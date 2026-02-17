package com.cdz.controller;

import com.cdz.payload.dto.DailySalesReportDTO;
import com.cdz.payload.dto.ItemSalesReportDTO;
import com.cdz.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Sales reports and analytics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily-sales/{storeId}")
    @Operation(summary = "Get daily sales report", description = "Returns daily sales summary for a date range")
    public ResponseEntity<List<DailySalesReportDTO>> getDailySalesReport(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getDailySalesReport(storeId, startDate, endDate));
    }

    @GetMapping("/item-sales/{storeId}")
    @Operation(summary = "Get item-wise sales report", description = "Returns product-level sales breakdown for a date range")
    public ResponseEntity<List<ItemSalesReportDTO>> getItemWiseSalesReport(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getItemWiseSalesReport(storeId, startDate, endDate));
    }
}

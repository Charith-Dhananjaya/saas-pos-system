package com.cdz.controller;

import com.cdz.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "SaaS business analytics and KPIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary/{storeId}")
    @Operation(summary = "Dashboard summary", description = "Total revenue, orders, customers, avg order value")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@PathVariable Long storeId) {
        return ResponseEntity.ok(analyticsService.getDashboardSummary(storeId));
    }

    @GetMapping("/revenue-trend/{storeId}")
    @Operation(summary = "Revenue trend", description = "Daily revenue for last N days")
    public ResponseEntity<List<Map<String, Object>>> getRevenueTrend(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getRevenueTrend(storeId, days));
    }

    @GetMapping("/top-products/{storeId}")
    @Operation(summary = "Top selling products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(analyticsService.getTopProducts(storeId, limit, period));
    }

    @GetMapping("/order-stats/{storeId}")
    @Operation(summary = "Order statistics", description = "Order counts by payment type")
    public ResponseEntity<Map<String, Object>> getOrderStats(@PathVariable Long storeId) {
        return ResponseEntity.ok(analyticsService.getOrderStats(storeId));
    }

    @GetMapping("/hourly-sales/{storeId}")
    @Operation(summary = "Hourly sales distribution", description = "Sales by hour of day (today)")
    public ResponseEntity<List<Map<String, Object>>> getHourlySales(@PathVariable Long storeId) {
        return ResponseEntity.ok(analyticsService.getHourlySales(storeId));
    }
}

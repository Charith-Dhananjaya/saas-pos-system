package com.cdz.service.impl;

import com.cdz.model.Order;
import com.cdz.model.OrderItem;
import com.cdz.repository.CustomerRepository;
import com.cdz.repository.OrderRepository;
import com.cdz.repository.ProductRepository;
import com.cdz.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Override
    public Map<String, Object> getDashboardSummary(Long storeId) {
        System.out.println("Fetching Dashboard Summary for Store ID: " + storeId);
        // Today's metrics
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> todayOrders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, startOfDay, endOfDay);

        double todayRevenue = todayOrders.stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        // Total metrics using efficient queries
        Double totalRevenue = orderRepository.sumTotalAmountByStoreId(storeId);
        if (totalRevenue == null)
            totalRevenue = 0.0;

        long totalOrders = orderRepository.countByStoreId(storeId);

        // Avg Order Value
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Count per store (Fixes global count bug)
        long totalCustomers = customerRepository.countByStoreId(storeId);
        long totalProducts = productRepository.countByStoreId(storeId);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("todayRevenue", Math.round(todayRevenue * 100.0) / 100.0);
        summary.put("todayOrders", todayOrders.size());
        summary.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        summary.put("totalOrders", totalOrders);
        summary.put("avgOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);
        summary.put("totalCustomers", totalCustomers);
        summary.put("totalProducts", totalProducts);
        return summary;
    }

    @Override
    public List<Map<String, Object>> getRevenueTrend(Long storeId, int days) {
        LocalDateTime start = LocalDate.now().minusDays(days - 1).atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, start, end);

        // Group by date
        Map<LocalDate, Double> dailyRevenue = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            dailyRevenue.put(LocalDate.now().minusDays(days - 1 - i), 0.0);
        }
        for (Order o : orders) {
            if (o.getCreatedAt() != null) {
                LocalDate date = o.getCreatedAt().toLocalDate();
                dailyRevenue.merge(date, o.getTotalAmount() != null ? o.getTotalAmount() : 0.0, Double::sum);
            }
        }

        List<Map<String, Object>> trend = new ArrayList<>();
        dailyRevenue.forEach((date, revenue) -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", date.toString());
            point.put("revenue", Math.round(revenue * 100.0) / 100.0);
            trend.add(point);
        });
        return trend;
    }

    @Override
    public List<Map<String, Object>> getTopProducts(Long storeId, int limit) {
        List<Order> orders = orderRepository.findByStoreId(storeId);

        // Count items sold per product
        Map<String, Long> productCount = new HashMap<>();
        Map<String, Double> productRevenue = new HashMap<>();

        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    String name = item.getProduct() != null ? item.getProduct().getName() : "Unknown";
                    productCount.merge(name, (long) item.getQuantity(), Long::sum);
                    double itemTotal = item.getQuantity() * (item.getPrice() != null ? item.getPrice() : 0);
                    productRevenue.merge(name, itemTotal, Double::sum);
                }
            }
        }

        return productCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> product = new LinkedHashMap<>();
                    product.put("name", entry.getKey());
                    product.put("unitsSold", entry.getValue());
                    product.put("revenue",
                            Math.round(productRevenue.getOrDefault(entry.getKey(), 0.0) * 100.0) / 100.0);
                    return product;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getOrderStats(Long storeId) {
        List<Order> orders = orderRepository.findByStoreId(storeId);

        // Group by payment type
        Map<String, Long> byPaymentType = orders.stream()
                .filter(o -> o.getPaymentType() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentType().name(),
                        Collectors.counting()));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalOrders", orders.size());
        stats.put("byPaymentType", byPaymentType);
        return stats;
    }

    @Override
    public List<Map<String, Object>> getHourlySales(Long storeId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> todayOrders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, startOfDay, endOfDay);

        // Initialize all 24 hours
        Map<Integer, Double> hourlySales = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) {
            hourlySales.put(h, 0.0);
        }
        for (Order o : todayOrders) {
            if (o.getCreatedAt() != null) {
                int hour = o.getCreatedAt().getHour();
                hourlySales.merge(hour, o.getTotalAmount() != null ? o.getTotalAmount() : 0.0, Double::sum);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        hourlySales.forEach((hour, sales) -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("hour", String.format("%02d:00", hour));
            point.put("sales", Math.round(sales * 100.0) / 100.0);
            result.add(point);
        });
        return result;
    }
}

package com.cdz.service.impl;

import com.cdz.model.Order;
import com.cdz.model.OrderItem;
import com.cdz.payload.dto.DailySalesReportDTO;
import com.cdz.payload.dto.ItemSalesReportDTO;
import com.cdz.repository.OrderRepository;
import com.cdz.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    @Override
    public List<DailySalesReportDTO> getDailySalesReport(Long storeId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, start, end);

        // Group orders by date
        Map<LocalDate, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().toLocalDate()));

        // Calculate metrics for each day
        return ordersByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<Order> dailyOrders = entry.getValue();

                    int totalOrders = dailyOrders.size();
                    double totalRevenue = dailyOrders.stream()
                            .mapToDouble(Order::getTotalAmount)
                            .sum();
                    double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                    return DailySalesReportDTO.builder()
                            .date(date)
                            .totalOrders(totalOrders)
                            .totalRevenue(totalRevenue)
                            .averageOrderValue(avgOrderValue)
                            .build();
                })
                .sorted((a, b) -> b.getDate().compareTo(a.getDate())) // Most recent first
                .collect(Collectors.toList());
    }

    @Override
    public List<ItemSalesReportDTO> getItemWiseSalesReport(Long storeId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, start, end);

        // Flatten all order items
        List<OrderItem> allItems = orders.stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.toList());

        // Group by product
        Map<String, List<OrderItem>> itemsByProduct = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getName()));

        // Calculate metrics for each product
        return itemsByProduct.entrySet().stream()
                .map(entry -> {
                    String productName = entry.getKey();
                    List<OrderItem> productItems = entry.getValue();

                    int totalQuantity = productItems.stream()
                            .mapToInt(OrderItem::getQuantity)
                            .sum();

                    double totalRevenue = productItems.stream()
                            .mapToDouble(OrderItem::getPrice)
                            .sum();

                    int numberOfOrders = (int) productItems.stream()
                            .map(item -> item.getOrder().getId())
                            .distinct()
                            .count();

                    String category = productItems.get(0).getProduct().getCategory() != null
                            ? productItems.get(0).getProduct().getCategory().getName()
                            : "Uncategorized";

                    return ItemSalesReportDTO.builder()
                            .productName(productName)
                            .category(category)
                            .totalQuantitySold(totalQuantity)
                            .totalRevenue(totalRevenue)
                            .numberOfOrders(numberOfOrders)
                            .build();
                })
                .sorted((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue())) // Highest revenue first
                .collect(Collectors.toList());
    }
}

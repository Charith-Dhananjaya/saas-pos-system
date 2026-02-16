package com.cdz.service;

import java.util.List;
import java.util.Map;

public interface AnalyticsService {

    Map<String, Object> getDashboardSummary(Long storeId);

    List<Map<String, Object>> getRevenueTrend(Long storeId, int days);

    List<Map<String, Object>> getTopProducts(Long storeId, int limit);

    Map<String, Object> getOrderStats(Long storeId);

    List<Map<String, Object>> getHourlySales(Long storeId);
}

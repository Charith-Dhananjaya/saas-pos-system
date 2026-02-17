package com.cdz.service;

import com.cdz.payload.dto.DailySalesReportDTO;
import com.cdz.payload.dto.ItemSalesReportDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    List<DailySalesReportDTO> getDailySalesReport(Long storeId, LocalDate startDate, LocalDate endDate);

    List<ItemSalesReportDTO> getItemWiseSalesReport(Long storeId, LocalDate startDate, LocalDate endDate);
}

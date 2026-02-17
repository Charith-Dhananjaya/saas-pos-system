package com.cdz.service;

import com.cdz.model.Inventory;
import com.cdz.model.Store;
import java.util.List;

public interface EmailService {
    void sendEmail(String to, String subject, String content, boolean isHtml);

    void sendLowStockAlert(Store store, List<Inventory> lowStockItems);
}

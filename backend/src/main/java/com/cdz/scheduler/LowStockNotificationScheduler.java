package com.cdz.scheduler;

import com.cdz.model.Inventory;
import com.cdz.model.Store;
import com.cdz.repository.InventoryRepository;
import com.cdz.repository.StoreRepository;
import com.cdz.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockNotificationScheduler {

    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;
    private final EmailService emailService;

    // Run every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void checkLowStockAndNotify() {
        log.info("Starting daily low stock check...");

        List<Store> stores = storeRepository.findAll();

        for (Store store : stores) {
            try {
                List<Inventory> lowStockItems = inventoryRepository.findLowStockByStoreId(store.getId());

                if (!lowStockItems.isEmpty()) {
                    log.info("Found {} low stock items for store: {}", lowStockItems.size(), store.getBrand());
                    emailService.sendLowStockAlert(store, lowStockItems);
                }
            } catch (Exception e) {
                log.error("Error processing low stock alert for store: {}", store.getId(), e);
            }
        }

        log.info("Completed daily low stock check.");
    }
}

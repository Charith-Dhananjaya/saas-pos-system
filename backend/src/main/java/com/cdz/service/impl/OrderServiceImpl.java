package com.cdz.service.impl;

import com.cdz.domain.OrderStatus;
import com.cdz.domain.PaymentType;
import com.cdz.mapper.OrderMapper;
import com.cdz.model.*;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.payload.dto.ReceiptDTO;
import com.cdz.repository.InventoryRepository;
import com.cdz.repository.OrderRepository;
import com.cdz.repository.ProductRepository;
import com.cdz.service.BillingService;
import com.cdz.service.OrderService;
import com.cdz.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private final OrderRepository orderRepository;
        private final UserService userService;
        private final ProductRepository productRepository;
        private final InventoryRepository inventoryRepository;
        private final BillingService billingService;

        @Override
        @Transactional
        public OrderDTO createOrder(OrderDTO orderDTO) throws Exception {

                User cashier = userService.getCurrentUser();

                Store store = cashier.getStore();
                if (store == null) {
                        throw new Exception("User's store not found");
                }
                System.out.println("Creating order for store: " + store.getId() + " - " + store.getBrand());

                Order order = Order.builder()
                                .store(store)
                                .cashier(cashier)
                                .customer(orderDTO.getCustomer())
                                .paymentType(orderDTO.getPaymentType())
                                .build();

                List<OrderItem> orderItems = orderDTO.getItems().stream().map(
                                itemDto -> {
                                        Product product = productRepository.findById(itemDto.getProductId())
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "product not found"));

                                        // Calculate discount
                                        double originalPrice = product.getSellingPrice();
                                        double discountPercentage = product.getDiscountPercentage() != null
                                                        ? product.getDiscountPercentage()
                                                        : 0.0;
                                        double discountAmount = (originalPrice * discountPercentage) / 100.0;
                                        double discountedPrice = originalPrice - discountAmount;

                                        double itemTotal = discountedPrice * itemDto.getQuantity();
                                        double itemDiscountTotal = discountAmount * itemDto.getQuantity();

                                        return OrderItem.builder()
                                                        .product(product)
                                                        .quantity(itemDto.getQuantity())
                                                        .price(itemTotal)
                                                        .originalPrice(originalPrice * itemDto.getQuantity())
                                                        .discountApplied(itemDiscountTotal)
                                                        .order(order)
                                                        .build();
                                }).toList();

                // Calculate subtotal (before discount), total discount, and final total
                double subtotal = orderItems.stream().mapToDouble(OrderItem::getOriginalPrice).sum();
                double totalDiscount = orderItems.stream().mapToDouble(OrderItem::getDiscountApplied).sum();
                double total = orderItems.stream().mapToDouble(OrderItem::getPrice).sum();

                order.setSubtotal(subtotal);
                order.setTotalDiscount(totalDiscount);
                order.setTotalAmount(total);
                order.setItems(orderItems);

                // Card payment: verify Stripe PaymentIntent succeeded before saving
                if (orderDTO.getPaymentType() == PaymentType.CARD && orderDTO.getStripePaymentIntentId() != null
                                && !orderDTO.getStripePaymentIntentId().isBlank()) {
                        if (!billingService.verifyPaymentSucceeded(orderDTO.getStripePaymentIntentId())) {
                                throw new Exception("Card payment not confirmed. Complete payment with Stripe first.");
                        }
                        order.setStripePaymentIntentId(orderDTO.getStripePaymentIntentId());
                }

                // Validate and deduct inventory BEFORE saving order
                for (OrderItem item : orderItems) {
                        Inventory inventory = inventoryRepository.findByProductIdAndStoreId(
                                        item.getProduct().getId(),
                                        store.getId());

                        if (inventory == null) {
                                throw new Exception("Product '" + item.getProduct().getName() +
                                                "' is not available in inventory");
                        }

                        // Check if sufficient stock is available
                        if (inventory.getQuantity() < item.getQuantity()) {
                                throw new Exception("Insufficient stock for '" + item.getProduct().getName() +
                                                "'. Available: " + inventory.getQuantity() +
                                                ", Requested: " + item.getQuantity());
                        }

                        // Deduct inventory
                        inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
                        inventoryRepository.save(inventory);
                }

                Order savedOrder = orderRepository.save(order);

                return OrderMapper.toDTO(savedOrder);
        }

        @Override
        public OrderDTO getOrderById(Long id) throws Exception {
                return orderRepository.findById(id)
                                .map(OrderMapper::toDTO)
                                .orElseThrow(() -> new EntityNotFoundException("order not found with id" + id));

        }

        @Override
        public List<OrderDTO> getOrdersByStore(
                        Long storeId,
                        Long customerId,
                        Long cashierId,
                        PaymentType paymentType,
                        OrderStatus status) throws Exception {

                return orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                                .filter(order -> customerId == null ||
                                                (order.getCustomer() != null &&
                                                                order.getCustomer().getId().equals(customerId)))
                                .filter(order -> cashierId == null ||
                                                (order.getCashier() != null &&
                                                                order.getCashier().getId().equals(cashierId)))
                                .filter(order -> paymentType == null ||
                                                order.getPaymentType() == paymentType)
                                .map(OrderMapper::toDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public List<OrderDTO> getOrdersByCashier(Long cashierId) {

                return orderRepository.findByCashierId(cashierId).stream()
                                .map(OrderMapper::toDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public void deleteOrder(Long id) throws Exception {

                Order order = orderRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("order not found with id" + id));

                orderRepository.delete(order);

        }

        @Override
        public List<OrderDTO> getOrdersByCustomerId(Long customerId) throws Exception {

                return orderRepository.findByCustomerId(customerId).stream()
                                .map(OrderMapper::toDTO)
                                .collect(Collectors.toList());

        }

        @Override
        public List<OrderDTO> getTodayOrdersByStore(Long storeId) throws Exception {

                LocalDate today = LocalDate.now();
                LocalDateTime start = today.atStartOfDay();
                LocalDateTime end = today.plusDays(1).atStartOfDay();

                return orderRepository.findByStoreIdAndCreatedAtBetween(storeId, start, end).stream()
                                .map(OrderMapper::toDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public List<OrderDTO> getTop5RecentOrdersByStoreId(Long storeId) throws Exception {
                return orderRepository.findTop5ByStoreIdOrderByCreatedAtDesc(storeId).stream()
                                .map(OrderMapper::toDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public OrderDTO updateOrder(Long id, OrderDTO orderDTO) throws Exception {

                Order existing = orderRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("order not found with id " + id));

                if (orderDTO.getPaymentType() != null) {
                        existing.setPaymentType(orderDTO.getPaymentType());
                }

                if (orderDTO.getCustomer() != null) {

                        existing.setCustomer(orderDTO.getCustomer());
                }

                if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
                        List<OrderItem> updatedItems = orderDTO.getItems().stream()
                                        .map(itemDto -> {

                                                if (itemDto.getProductId() == null) {
                                                        throw new EntityNotFoundException(
                                                                        "productId is required for each item");
                                                }
                                                Product product = productRepository.findById(itemDto.getProductId())
                                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                                "product not found: " + itemDto
                                                                                                .getProductId()));

                                                return OrderItem.builder()
                                                                .id(itemDto.getId())
                                                                .product(product)
                                                                .quantity(itemDto.getQuantity())
                                                                .price(product.getSellingPrice()
                                                                                * itemDto.getQuantity())
                                                                .order(existing)
                                                                .build();
                                        })
                                        .collect(Collectors.toList());

                        existing.setItems(updatedItems);

                        double total = updatedItems.stream().mapToDouble(OrderItem::getPrice).sum();
                        existing.setTotalAmount(total);
                }

                Order saved = orderRepository.save(existing);
                return OrderMapper.toDTO(saved);
        }

        @Override
        public ReceiptDTO generateReceipt(Long orderId) throws Exception {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new EntityNotFoundException("Order not found with id " + orderId));

                // Generate receipt number
                String receiptNumber = String.format("RCP-%d-%d", order.getStore().getId(), order.getId());

                // Get Store Contact info safely
                String storeBrand = order.getStore().getBrand();
                String storeAddress = "";
                String storePhone = "";
                if (order.getStore().getContact() != null) {
                        storeAddress = order.getStore().getContact().getAddress();
                        storePhone = order.getStore().getContact().getPhone();
                }

                // Build receipt items
                List<ReceiptDTO.ReceiptItemDTO> receiptItems = order.getItems().stream()
                                .map(item -> {
                                        Product product = item.getProduct();

                                        // Handle potential nulls
                                        double itemOriginalPrice = item.getOriginalPrice() != null
                                                        ? item.getOriginalPrice()
                                                        : (item.getPrice() != null ? item.getPrice() : 0.0);
                                        double itemDiscountApplied = item.getDiscountApplied() != null
                                                        ? item.getDiscountApplied()
                                                        : 0.0;
                                        double itemPrice = item.getPrice() != null ? item.getPrice() : 0.0;
                                        int quantity = item.getQuantity() != null ? item.getQuantity() : 1;

                                        double originalPricePerUnit = quantity > 0 ? itemOriginalPrice / quantity : 0.0;
                                        double discountAmountPerUnit = quantity > 0 ? itemDiscountApplied / quantity
                                                        : 0.0;
                                        double finalPricePerUnit = quantity > 0 ? itemPrice / quantity : 0.0;
                                        double discountPercentage = (product != null
                                                        && product.getDiscountPercentage() != null)
                                                                        ? product.getDiscountPercentage()
                                                                        : 0.0;

                                        return ReceiptDTO.ReceiptItemDTO.builder()
                                                        .productName(product != null ? product.getName()
                                                                        : "Unknown Product")
                                                        .productSku(product != null ? product.getSku() : "")
                                                        .quantity(quantity)
                                                        .originalPrice(originalPricePerUnit)
                                                        .discountPercentage(discountPercentage)
                                                        .discountAmount(discountAmountPerUnit)
                                                        .finalPrice(finalPricePerUnit)
                                                        .lineTotal(itemPrice)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                // Build receipt DTO
                return ReceiptDTO.builder()
                                .orderId(order.getId())
                                .receiptNumber(receiptNumber)
                                .orderDate(order.getCreatedAt())
                                .storeName(storeBrand)
                                .storeAddress(storeAddress)
                                .storePhone(storePhone)
                                .cashierName(order.getCashier() != null ? order.getCashier().getFullName() : "Cashier")
                                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                                .items(receiptItems)
                                .paymentType(order.getPaymentType() != null ? order.getPaymentType().toString()
                                                : "CASH")
                                .subtotal(order.getSubtotal() != null ? order.getSubtotal() : 0.0)
                                .totalDiscount(order.getTotalDiscount() != null ? order.getTotalDiscount() : 0.0)
                                .totalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                                .build();
        }
}

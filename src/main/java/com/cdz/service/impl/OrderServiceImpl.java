package com.cdz.service.impl;

import com.cdz.domain.OrderStatus;
import com.cdz.domain.PaymentType;
import com.cdz.mapper.OrderMapper;
import com.cdz.model.*;
import com.cdz.payload.dto.OrderDTO;
import com.cdz.repository.OrderRepository;
import com.cdz.repository.ProductRepository;
import com.cdz.service.BillingService;
import com.cdz.service.OrderService;
import com.cdz.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    private final BillingService billingService;


    @Override
    public OrderDTO createOrder(OrderDTO orderDTO) throws Exception {

        User cashier = userService.getCurrentUser();

        Store store = cashier.getStore();
        if (store == null) {
            throw new Exception("User's store not found");
        }

        Order order = Order.builder()
                .store(store)
                .cashier(cashier)
                .customer(orderDTO.getCustomer())
                .paymentType(orderDTO.getPaymentType())
                .build();

        List<OrderItem> orderItems = orderDTO.getItems().stream().map(
                itemDto -> {
                    Product product = productRepository.findById(itemDto.getProductId())
                            .orElseThrow(() -> new EntityNotFoundException("product not found"));

                    return OrderItem.builder()
                            .product(product)
                            .quantity(itemDto.getQuantity())
                            .price(product.getSellingPrice() * itemDto.getQuantity())
                            .order(order)
                            .build();
                }
        ).toList();

        double total = orderItems.stream().mapToDouble(OrderItem::getPrice).sum();
        order.setTotalAmount(total);
        order.setItems(orderItems);

        // Card payment: verify Stripe PaymentIntent succeeded before saving
        if (orderDTO.getPaymentType() == PaymentType.CARD && orderDTO.getStripePaymentIntentId() != null && !orderDTO.getStripePaymentIntentId().isBlank()) {
            if (!billingService.verifyPaymentSucceeded(orderDTO.getStripePaymentIntentId())) {
                throw new Exception("Card payment not confirmed. Complete payment with Stripe first.");
            }
            order.setStripePaymentIntentId(orderDTO.getStripePaymentIntentId());
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
            OrderStatus status
    ) throws Exception {

        return orderRepository.findByStoreId(storeId).stream()
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
                            throw new EntityNotFoundException("productId is required for each item");
                        }
                        Product product = productRepository.findById(itemDto.getProductId())
                                .orElseThrow(() -> new EntityNotFoundException("product not found: " + itemDto.getProductId()));

                        return OrderItem.builder()
                                .id(itemDto.getId())
                                .product(product)
                                .quantity(itemDto.getQuantity())
                                .price(product.getSellingPrice() * itemDto.getQuantity())
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
}

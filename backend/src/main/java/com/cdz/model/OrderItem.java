package com.cdz.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Integer quantity;

    private Double price; // Final price after discount
    private Double originalPrice; // Price before discount
    private Double discountApplied = 0.0; // Actual discount amount applied

    @ManyToOne
    private Product product;

    @ManyToOne
    private Order order;
}

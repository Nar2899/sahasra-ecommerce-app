package com.sahasra.commerce.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_sku", columnList = "sku", unique = true),
    @Index(name = "idx_products_category", columnList = "category")
})
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salePriceInr;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal regularPriceInr;

    @Column(nullable = false)
    private Integer availableStock;

    @Column(nullable = false)
    private Integer reservedStock = 0;

    /**
     * Optimistic Concurrency Control version column.
     * Prevents lost updates and negative stock during flash-sale spikes.
     */
    @Version
    @Column(nullable = false)
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public void reserveStock(int quantity) {
        if (this.availableStock < quantity) {
            throw new IllegalStateException("Insufficient stock for SKU: " + this.sku);
        }
        this.availableStock -= quantity;
        this.reservedStock += quantity;
    }

    public void commitReservation(int quantity) {
        this.reservedStock = Math.max(0, this.reservedStock - quantity);
    }

    // Standard getters & setters
    public String getId() { return id; }
    public String getSku() { return sku; }
    public String getTitle() { return title; }
    public BigDecimal getSalePriceInr() { return salePriceInr; }
    public Integer getAvailableStock() { return availableStock; }
    public Long getVersion() { return version; }
}

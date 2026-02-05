package com.cdz.repository;

import com.cdz.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Long> {

    List<Product> findByStoreId (Long storeId);

    @Query("SELECT p FROM Product p " +
            "WHERE p.store.id = :storeId AND (" +
            "LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.sku)   LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            ")")
    List<Product> searchByKeyword(@Param("storeId") Long storeId,
                                  @Param("keyword") String keyword);

}

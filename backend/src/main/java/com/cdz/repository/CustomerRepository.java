package com.cdz.repository;

import com.cdz.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String firstName, String email);

    List<Customer> findByStoreId(Long storeId);

    long countByStoreId(Long storeId);

}

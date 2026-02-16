package com.cdz.controller;

import com.cdz.model.Customer;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Customer management")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create a customer")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) throws Exception {
        return ResponseEntity.ok(customerService.updateCustomer(id, customer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a customer")
    public ResponseEntity<ApiResponse> deleteCustomer(@PathVariable long id) throws Exception {
        customerService.deleteCustomer(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Customer deleted successfully");
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    @Operation(summary = "Get all customers")
    public ResponseEntity<List<Customer>> getAll() throws Exception {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by name or phone")
    public ResponseEntity<List<Customer>> searchCustomer(@RequestParam String q) throws Exception {
        return ResponseEntity.ok(customerService.searchCustomer(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(customerService.getCustomer(id));
    }
}

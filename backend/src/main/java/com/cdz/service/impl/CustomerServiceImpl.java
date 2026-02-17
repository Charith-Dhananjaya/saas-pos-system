package com.cdz.service.impl;

import com.cdz.model.Customer;
import com.cdz.repository.CustomerRepository;
import com.cdz.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public Customer createCustomer(Customer customer) {

        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customerDetails) throws Exception {
        Customer customerToUpdate = customerRepository.findById(id).orElseThrow(
                () -> new Exception("Customer not found"));

        customerToUpdate.setFullName(customerDetails.getFullName());
        customerToUpdate.setEmail(customerDetails.getEmail());
        customerToUpdate.setPhone(customerDetails.getPhone());
        return customerRepository.save(customerToUpdate);
    }

    @Override
    public void deleteCustomer(Long id) throws Exception {

        Customer customerToUpdate = customerRepository.findById(id).orElseThrow(
                () -> new Exception("Customer not found"));
        customerRepository.delete(customerToUpdate);
    }

    @Override
    public Customer getCustomer(Long id) throws Exception {
        return customerRepository.findById(id).orElseThrow(
                () -> new Exception("Customer not found"));
    }

    @Override
    public List<Customer> getAllCustomers() throws Exception {
        return customerRepository.findAll();
    }

    @Override
    public List<Customer> getCustomersByStoreId(Long storeId) {
        return customerRepository.findByStoreId(storeId);
    }

    @Override
    public List<Customer> searchCustomer(String keyword) throws Exception {
        return customerRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword);
    }
}

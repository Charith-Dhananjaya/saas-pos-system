package com.cdz.service.impl;

import com.cdz.domain.UserRole;
import com.cdz.mapper.UserMapper;
import com.cdz.model.Store;
import com.cdz.model.User;
import com.cdz.payload.dto.UserDto;
import com.cdz.repository.StoreRepository;
import com.cdz.repository.UserRepository;
import com.cdz.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Override
    public UserDto createStoreEmployee(UserDto employee, Long storeId) throws Exception {
        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new Exception("Store not found")
        );
        User user = UserMapper.toEntity(employee);
        user.setStore(store);
        user.setPassword(passwordEncoder.encode(employee.getPassword()));
        User savedEmployee = userRepository.save(user);
        return UserMapper.toDTO(savedEmployee);
    }

    @Transactional
    @Override
    public UserDto updateEmployee(Long employeeId, UserDto employeeDetails) throws Exception {

        User existingEmployee = userRepository.findById(employeeId)
                .orElseThrow(() -> new Exception("Employee not existed.."));

        // Update simple fields
        if (employeeDetails.getEmail() != null) {
            existingEmployee.setEmail(employeeDetails.getEmail());
        }
        if (employeeDetails.getFullName() != null) {
            existingEmployee.setFullName(employeeDetails.getFullName());
        }
        if (employeeDetails.getPhone() != null) {
            existingEmployee.setPhone(employeeDetails.getPhone());
        }
        if (employeeDetails.getRole() != null) {
            existingEmployee.setRole(employeeDetails.getRole());
        }

        // Update password only if non-empty
        if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().isBlank()) {
            existingEmployee.setPassword(passwordEncoder.encode(employeeDetails.getPassword()));
        }

        // Update store if provided
        if (employeeDetails.getStoreId() != null) {
            Store store = storeRepository.findById(employeeDetails.getStoreId())
                    .orElseThrow(() -> new Exception("Store not found"));
            existingEmployee.setStore(store);
        }

        User saved = userRepository.save(existingEmployee);
        return UserMapper.toDTO(saved); // return shallow DTO
    }

    @Override
    public void deleteEmployee(Long employeeId) throws Exception {
        User employee = userRepository.findById(employeeId).orElseThrow(
                ()-> new Exception("employee not found...")
        );

        userRepository.delete(employee);

    }

    @Override
    public List<UserDto> findStoreEmployees(Long storeId, UserRole role) throws Exception {

        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new Exception("Store not found")
        );

        return userRepository.findByStore(store).stream().filter(
                user -> role == null || user.getRole() == role)
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

}

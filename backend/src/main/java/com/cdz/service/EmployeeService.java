package com.cdz.service;

import com.cdz.domain.UserRole;
import com.cdz.model.User;
import com.cdz.payload.dto.UserDto;

import java.util.List;

public interface EmployeeService {

    UserDto createStoreEmployee(UserDto employee, Long storeId) throws Exception;

    UserDto updateEmployee(Long employeeId, UserDto employeeDetails) throws Exception;

    void deleteEmployee(Long employeeId) throws Exception;

    List<UserDto> findStoreEmployees(Long storeId, UserRole role) throws Exception;
}

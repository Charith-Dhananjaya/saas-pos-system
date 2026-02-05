package com.cdz.controller;


import com.cdz.domain.UserRole;
import com.cdz.model.User;
import com.cdz.payload.dto.UserDto;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/store/{storeId}")
    public ResponseEntity<UserDto> createEmployee(
            @PathVariable Long storeId,
            @RequestBody UserDto userDto) throws Exception {
        UserDto employee = employeeService.createStoreEmployee(userDto, storeId);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateEmployee(
            @PathVariable Long id,
            @RequestBody UserDto userDto) throws Exception {

        UserDto employee = employeeService.updateEmployee(id, userDto);
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEmployee(
            @PathVariable Long id
    ) throws Exception {
        employeeService.deleteEmployee(id);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Employee Deleted");

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<UserDto>> getEmployeesByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) UserRole userRole) throws Exception {
        return ResponseEntity.ok(employeeService.findStoreEmployees(storeId, userRole));
    }
}

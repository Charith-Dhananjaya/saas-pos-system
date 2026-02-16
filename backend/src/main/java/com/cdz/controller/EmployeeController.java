package com.cdz.controller;

import com.cdz.domain.UserRole;
import com.cdz.payload.dto.UserDto;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Store employee management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/store/{storeId}")
    @Operation(summary = "Create an employee for a store")
    public ResponseEntity<UserDto> createEmployee(
            @PathVariable Long storeId,
            @RequestBody UserDto userDto) throws Exception {
        return ResponseEntity.ok(employeeService.createStoreEmployee(userDto, storeId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an employee")
    public ResponseEntity<UserDto> updateEmployee(
            @PathVariable Long id,
            @RequestBody UserDto userDto) throws Exception {
        return ResponseEntity.ok(employeeService.updateEmployee(id, userDto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an employee")
    public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable Long id) throws Exception {
        employeeService.deleteEmployee(id);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Employee Deleted");
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get employees by store", description = "Optionally filter by user role")
    public ResponseEntity<List<UserDto>> getEmployeesByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) UserRole userRole) throws Exception {
        return ResponseEntity.ok(employeeService.findStoreEmployees(storeId, userRole));
    }
}

package com.cdz.controller;

import com.cdz.payload.dto.ShiftReportDTO;
import com.cdz.service.ShiftReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shift-report")
@Tag(name = "Shift Reports", description = "Cashier shift tracking and reporting")
public class ShiftReportController {

        private final ShiftReportService shiftReportService;

        @PostMapping("/start")
        @Operation(summary = "Start a new shift")
        public ResponseEntity<ShiftReportDTO> startShift() throws Exception {
                return ResponseEntity.ok(shiftReportService.startShift());
        }

        @PatchMapping("/end")
        @Operation(summary = "End the current shift")
        public ResponseEntity<ShiftReportDTO> endShift() throws Exception {
                return ResponseEntity.ok(shiftReportService.endShift(null, LocalDateTime.now()));
        }

        @GetMapping("/current")
        @Operation(summary = "Get current active shift progress")
        public ResponseEntity<ShiftReportDTO> getCurrentShiftProgress() throws Exception {
                return ResponseEntity.ok(shiftReportService.getCurrentShiftProgress(null));
        }

        @GetMapping("/cashier/{cashierId}/by-date")
        @Operation(summary = "Get shift report by cashier and date")
        public ResponseEntity<ShiftReportDTO> getShiftReportByDate(
                        @PathVariable Long cashierId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date)
                        throws Exception {
                return ResponseEntity.ok(shiftReportService.getShiftByCashierAndDate(cashierId, date));
        }

        @GetMapping("/cashier/{cashierId}")
        @Operation(summary = "Get all shift reports for a cashier")
        public ResponseEntity<List<ShiftReportDTO>> getShiftReportByCashier(@PathVariable Long cashierId) {
                return ResponseEntity.ok(shiftReportService.getShiftReportsByCashierId(cashierId));
        }

        @GetMapping("/store/{storeId}")
        @Operation(summary = "Get all shift reports for a store")
        public ResponseEntity<List<ShiftReportDTO>> getShiftReportByStore(@PathVariable Long storeId) {
                return ResponseEntity.ok(shiftReportService.getShiftReportsByStoreId(storeId));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get shift report by ID")
        public ResponseEntity<ShiftReportDTO> getShiftReportById(@PathVariable Long id) throws Exception {
                return ResponseEntity.ok(shiftReportService.getShiftReportById(id));
        }
}

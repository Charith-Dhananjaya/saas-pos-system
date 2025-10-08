package com.cdz.repository;

import com.cdz.model.ShiftReport;
import com.cdz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftReportRepository extends JpaRepository<ShiftReport, Long> {

    List<ShiftReport> findByCashierId(Long id);

    List<ShiftReport> findByBranchId(Long id);


    Optional<ShiftReport> findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(User cashier);


    Optional<ShiftReport> findByCashierAndShiftStartBetween(
            User cashier,
            LocalDateTime start,
            LocalDateTime end
    );
}
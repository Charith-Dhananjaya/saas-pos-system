package com.cdz.payload.dto;

import com.cdz.domain.StoreStatus;
import com.cdz.model.StoreContact;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StoreDto {

    private long id;

    private String brand;

    private UserDto storeAdmin;

    private String description;

    private String storeType;

    private StoreStatus status;

    private StoreContact contact;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}

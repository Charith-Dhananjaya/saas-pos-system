package com.cdz.payload.dto;

import com.cdz.model.Store;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDTO {

    private Long id;

    private String name;

//    private Store store;

    private Long storeId;
}



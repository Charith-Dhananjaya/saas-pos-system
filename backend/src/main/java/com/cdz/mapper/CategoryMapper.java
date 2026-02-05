package com.cdz.mapper;

import com.cdz.model.Category;
import com.cdz.payload.dto.CategoryDTO;

public class CategoryMapper {


    public static CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .storeId(category.getStore()!=null?category.getStore().getId():null)
                .build();
    }
}

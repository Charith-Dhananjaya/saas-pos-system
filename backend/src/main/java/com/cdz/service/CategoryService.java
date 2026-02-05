package com.cdz.service;

import com.cdz.exceptions.UserException;
import com.cdz.payload.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {

    CategoryDTO createCategory(CategoryDTO dto) throws Exception;
    List<CategoryDTO> getCategoriesByStore(Long storeId);
    CategoryDTO updateCategory(Long id,  CategoryDTO dto) throws Exception;
    void deleteCategory(Long id) throws Exception;
}

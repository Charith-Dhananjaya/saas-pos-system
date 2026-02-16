package com.cdz.controller;

import com.cdz.payload.dto.CategoryDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Manage product categories")
public class CategoryController {

        private final CategoryService categoryService;

        @PostMapping
        @Operation(summary = "Create a category")
        public ResponseEntity<CategoryDTO> createCategory(
                        @RequestBody CategoryDTO categoryDTO) throws Exception {
                return ResponseEntity.ok(categoryService.createCategory(categoryDTO));
        }

        @GetMapping("/store/{storeId}")
        @Operation(summary = "Get categories by store")
        public ResponseEntity<List<CategoryDTO>> getCategoriesByStoreId(
                        @PathVariable long storeId) {
                return ResponseEntity.ok(categoryService.getCategoriesByStore(storeId));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update a category")
        public ResponseEntity<CategoryDTO> updateCategory(
                        @RequestBody CategoryDTO categoryDTO,
                        @PathVariable long id) throws Exception {
                return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete a category")
        public ResponseEntity<ApiResponse> deleteCategory(
                        @PathVariable long id) throws Exception {
                categoryService.deleteCategory(id);
                ApiResponse apiResponse = new ApiResponse();
                apiResponse.setMessage("Category deleted successfully");
                return ResponseEntity.ok(apiResponse);
        }
}

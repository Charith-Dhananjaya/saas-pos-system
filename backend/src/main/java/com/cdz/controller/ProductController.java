package com.cdz.controller;

import com.cdz.model.User;
import com.cdz.payload.dto.ProductDTO;
import com.cdz.payload.response.ApiResponse;
import com.cdz.service.ProductService;
import com.cdz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
@Tag(name = "Products", description = "CRUD operations for products in a store")
public class ProductController {
        private final ProductService productService;
        private final UserService userService;

        @PostMapping
        @Operation(summary = "Create a product", description = "Add a new product to the authenticated user's store")
        public ResponseEntity<ProductDTO> create(@RequestBody ProductDTO productDTO,
                        @RequestHeader("Authorization") String jwt) throws Exception {
                User user = userService.getUserFromJwtToken(jwt);
                return ResponseEntity.ok(productService.createProduct(productDTO, user));
        }

        @GetMapping("/store/{storeId}")
        @Operation(summary = "Get products by store", description = "Retrieve all products for a given store ID")
        public ResponseEntity<List<ProductDTO>> getByStoreId(@PathVariable Long storeId,
                        @RequestHeader("Authorization") String jwt) throws Exception {
                return ResponseEntity.ok(productService.getProductsByStoreId(storeId));
        }

        @PatchMapping("/{id}")
        @Operation(summary = "Update a product", description = "Partially update a product by its ID")
        public ResponseEntity<ProductDTO> update(
                        @PathVariable Long id,
                        @RequestBody ProductDTO productDTO,
                        @RequestHeader("Authorization") String jwt) throws Exception {
                User user = userService.getUserFromJwtToken(jwt);
                return ResponseEntity.ok(productService.updateProduct(id, productDTO, user));
        }

        @GetMapping("/store/{storeId}/search")
        @Operation(summary = "Search products", description = "Search products in a store by keyword")
        public ResponseEntity<List<ProductDTO>> searchByKeyword(
                        @PathVariable Long storeId,
                        @RequestParam String keyword,
                        @RequestHeader("Authorization") String jwt) throws Exception {
                return ResponseEntity.ok(productService.searchByKeyword(storeId, keyword));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete a product", description = "Remove a product by its ID")
        public ResponseEntity<ApiResponse> delete(
                        @PathVariable Long id,
                        @RequestHeader("Authorization") String jwt) throws Exception {
                User user = userService.getUserFromJwtToken(jwt);
                productService.deleteProduct(id, user);
                ApiResponse apiResponse = new ApiResponse();
                apiResponse.setMessage("Product deleted successfully");
                return ResponseEntity.ok(apiResponse);
        }
}

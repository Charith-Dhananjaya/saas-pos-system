package com.cdz.service.impl;

import com.cdz.domain.UserRole;
import com.cdz.exceptions.UserException;
import com.cdz.mapper.CategoryMapper;
import com.cdz.model.Category;
import com.cdz.model.Store;
import com.cdz.model.User;
import com.cdz.payload.dto.CategoryDTO;
import com.cdz.repository.CategoryRepository;
import com.cdz.repository.StoreRepository;
import com.cdz.service.CategoryService;
import com.cdz.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final UserService userService;



    @Override
    public CategoryDTO createCategory(CategoryDTO dto) throws Exception {

        User user = userService.getCurrentUser();
        Store store = storeRepository.findById(dto.getStoreId()).orElseThrow(
                () -> new Exception("Store not found")
        );
        Category category = Category.builder()
                .store(store)
                .name(dto.getName())
                .build();

        checkAuthority(user, category.getStore());

        return CategoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    public List<CategoryDTO> getCategoriesByStore(Long storeId) {
        List<Category> categories = categoryRepository.findByStoreId(storeId);
        return categories.stream()
                .map(
                        CategoryMapper::toDTO
                ).collect(Collectors.toList());

    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) throws Exception {
        Category category = categoryRepository.findById(id).orElseThrow(
                ()-> new Exception("category not found")
        );
        User user = userService.getCurrentUser();
        category.setName(dto.getName());

        checkAuthority(user, category.getStore());

        return CategoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) throws Exception {
        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new Exception("category not found")
        );
        User user = userService.getCurrentUser();

        checkAuthority(user, category.getStore());

        categoryRepository.delete(category);
    }

    private void checkAuthority(User user, Store store) throws Exception {
        boolean isOwner = user.getRole() == UserRole.ROLE_OWNER;
        boolean isSameStore = store.getStoreAdmin() != null && user.getId().equals(store.getStoreAdmin().getId());
        if (!isOwner || !isSameStore) {
            throw new Exception("You don't have permission to manage this category");
        }
    }

}

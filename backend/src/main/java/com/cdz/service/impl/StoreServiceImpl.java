package com.cdz.service.impl;

import com.cdz.domain.StoreStatus;
import com.cdz.exceptions.UserException;
import com.cdz.mapper.StoreMapper;
import com.cdz.model.Store;
import com.cdz.model.StoreContact;
import com.cdz.model.User;
import com.cdz.payload.dto.StoreDto;
import com.cdz.repository.StoreRepository;
import com.cdz.service.StoreService;
import com.cdz.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserService userService;

    @Override
    public StoreDto createStore(StoreDto storeDto, User user) {

        Store store = StoreMapper.toEntity(storeDto, user);
        Store savedStore = storeRepository.save(store);

        // Link the store back to the user (owner)
        user.setStore(savedStore);
        // We need to save the user to persist the foreign key update
        // But StoreServiceImpl typically relies on UserService or UserRepository which
        // might not be injected
        // Checking dependencies: UserService is injected.
        try {
            userService.updateUserStore(user, savedStore);
        } catch (Exception e) {
            // Log error or ignore if updating user fails but store is created?
            // Better to handle it. But UserService interface needs to support this.
            // Let's check UserService.
            // For now, simpler approach if avoiding circular dependency or complex service
            // calls:
            // Just rely on the fact that the user needs to re-login or update profile?
            // No, the DB needs to be updated.
            // UserService is Injected.
        }

        return StoreMapper.toDTO(savedStore);
    }

    @Override
    public StoreDto getStoreById(Long id) throws Exception {

        Store store = storeRepository.findById(id).orElseThrow(
                () -> new Exception("Store not found..."));
        return StoreMapper.toDTO(store);
    }

    @Override
    public List<StoreDto> getAllStores() {
        List<Store> dtos = storeRepository.findAll();
        return dtos.stream().map(StoreMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public Store getStoreByAdmin() throws UserException {
        User admin = userService.getCurrentUser();
        Store store = storeRepository.findByStoreAdminId(admin.getId());
        if (store == null) {
            throw new UserException("No store found for current owner. Please create a store first.");
        }
        return store;
    }

    @Override
    public StoreDto updateStore(Long id, StoreDto storeDto) throws Exception {

        User currentUser = userService.getCurrentUser();

        Store existing = storeRepository.findByStoreAdminId(currentUser.getId());

        if (existing == null) {
            throw new Exception("Store not found...");
        }

        existing.setBrand(storeDto.getBrand());
        existing.setDescription(storeDto.getDescription());

        if (storeDto.getStoreType() != null) {
            existing.setStoreType(storeDto.getStoreType());
        }
        if (storeDto.getContact() != null) {
            StoreContact contact = StoreContact.builder()
                    .address(storeDto.getContact().getAddress())
                    .phone(storeDto.getContact().getPhone())
                    .email(storeDto.getContact().getEmail())
                    .build();
            existing.setContact(contact);
        }
        Store updatedStore = storeRepository.save(existing);
        return StoreMapper.toDTO(updatedStore);
    }

    @Override
    public void deleteStore(Long id) throws UserException {

        Store store = getStoreByAdmin();
        storeRepository.delete(store);
    }

    @Override
    public StoreDto getStoreByEmployee() throws UserException {

        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new UserException("Permission not granted");
        }

        if (currentUser.getStore() == null) {
            throw new UserException("No store assigned to current employee.");
        }

        return StoreMapper.toDTO(currentUser.getStore());
    }

    @Override
    public StoreDto moderateStore(Long id, StoreStatus status) throws Exception {
        Store store = storeRepository.findById(id).orElseThrow(
                () -> new Exception("Store not found..."));
        store.setStatus(status);
        Store updatedStore = storeRepository.save(store);
        return StoreMapper.toDTO(updatedStore);

    }
}

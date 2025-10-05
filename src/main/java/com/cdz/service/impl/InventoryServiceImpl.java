package com.cdz.service.impl;

import com.cdz.mapper.InventoryMapper;
import com.cdz.model.Branch;
import com.cdz.model.Inventory;
import com.cdz.model.Product;
import com.cdz.payload.dto.InventoryDTO;
import com.cdz.repository.BranchRepository;
import com.cdz.repository.InventoryRepository;
import com.cdz.repository.ProductRepository;
import com.cdz.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;

    @Override
    public InventoryDTO createInventory(InventoryDTO inventoryDTO) throws Exception {

        Branch branch =  branchRepository.findById(inventoryDTO.getBranchId()).orElseThrow(
                ()-> new Exception("branch not found...")
        );
        Product product = productRepository.findById(inventoryDTO.getProductId()).orElseThrow(
                ()-> new Exception("product not found...")
        );

        Inventory  inventory = InventoryMapper.toEntity(inventoryDTO,branch,product);
        Inventory savedInventory = inventoryRepository.save(inventory);
        return InventoryMapper.toDTO(savedInventory);
    }

    @Override
    public InventoryDTO updateInventory(Long id, InventoryDTO inventoryDTO) throws Exception {

        Inventory inventory = inventoryRepository.findById(id).orElseThrow(
                ()-> new Exception("Inventory not found...")
        );

        inventory.setQuantity(inventoryDTO.getQuantity());
        Inventory updatedInventory = inventoryRepository.save(inventory);
        return InventoryMapper.toDTO(updatedInventory);
    }

    @Override
    public void deleteInventory(Long id) throws Exception {

        Inventory inventory = inventoryRepository.findById(id).orElseThrow(
                ()-> new Exception("Inventory not found...")
        );
        inventoryRepository.delete(inventory);


    }

    @Override
    public InventoryDTO getInventoryById(Long id) throws Exception {
        Inventory inventory = inventoryRepository.findById(id).orElseThrow(
                ()-> new Exception("Inventory not found...")
        );
        return InventoryMapper.toDTO(inventory);
    }

    @Override
    public InventoryDTO getInventoryByProductIdAndBranchId(Long productId, Long branchId) {
        Inventory inventory = inventoryRepository.findByProductIdAndBranchId(productId, branchId);

        return InventoryMapper.toDTO(inventory);
    }

    @Override
    public List<InventoryDTO> getInventoryByBranchId(Long branchId) {
       List<Inventory> inventories = inventoryRepository.findByBranchId(branchId);

        return inventories.stream().map(
                InventoryMapper::toDTO)
                .collect(Collectors.toList());
    }
}

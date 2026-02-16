package com.cdz.config;

import com.cdz.domain.PaymentType;
import com.cdz.domain.StoreStatus;
import com.cdz.domain.UserRole;
import com.cdz.model.*;
import com.cdz.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (storeRepository.count() > 0) {
            log.info("Data already seeded. Skipping...");
            return;
        }

        log.info("Seeding data...");

        // 1. Create Store
        Store store = new Store();
        store.setBrand("CDZ Retail Store");
        store.setDescription("Your one-stop shop for everything.");
        store.setStoreType("Retail");
        store.setStatus(StoreStatus.ACTIVE);

        StoreContact contact = new StoreContact();
        contact.setAddress("123 Main St, Tech City");
        contact.setPhone("+1234567890");
        contact.setEmail("contact@cdzretail.com");
        store.setContact(contact);

        store = storeRepository.save(store);

        // 2. Create Owner User
        User owner = new User();
        owner.setFullName("Charith De Mel");
        owner.setEmail("charith.ddm@gmail.com"); // Matches screenshot
        owner.setPassword(passwordEncoder.encode("password"));
        owner.setRole(UserRole.ROLE_OWNER);
        owner.setPhone("+1234567890");
        owner.setStore(store);
        owner.setProfileImage("https://ui-avatars.com/api/?name=Charith+De+Mel&background=10b981&color=fff");
        userRepository.save(owner);

        // Link owner to store as storeAdmin
        store.setStoreAdmin(owner);
        storeRepository.save(store);

        // 3. Create Categories
        List<Category> categories = new ArrayList<>();
        String[] catNames = { "Electronics", "Clothing", "Home & Garden", "Books", "Toys" };
        for (String catName : catNames) {
            Category category = new Category();
            category.setName(catName);
            category.setStore(store);
            categories.add(categoryRepository.save(category));
        }

        // 4. Create Products & Inventory
        List<Product> products = new ArrayList<>();
        String[] prodNames = { "Smartphone", "Laptop", "T-Shirt", "Jeans", "Sofa", "Desk", "Novel", "Action Figure" };
        Random random = new Random();

        for (int i = 0; i < 20; i++) {
            Product product = new Product();
            product.setName(prodNames[random.nextInt(prodNames.length)] + " " + (i + 1));
            product.setDescription("High quality product.");

            double price = 10 + random.nextInt(990);
            product.setMrp(price * 1.2); // MRP 20% higher
            product.setSellingPrice(price);

            product.setSku("SKU-" + (1000 + i));
            product.setBrand("Generic Brand");
            product.setCategory(categories.get(random.nextInt(categories.size())));
            product.setStore(store);
            product = productRepository.save(product);
            products.add(product);

            // Create Inventory
            Inventory inventory = new Inventory();
            inventory.setProduct(product);
            inventory.setStore(store);
            inventory.setQuantity(10 + random.nextInt(90));
            inventoryRepository.save(inventory);
        }

        // 5. Create Customers
        List<Customer> customers = new ArrayList<>();
        String[] customerNames = { "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis" };
        for (String name : customerNames) {
            Customer customer = new Customer();
            customer.setFullName(name);
            customer.setEmail(name.toLowerCase().replace(" ", ".") + "@example.com");
            customer.setPhone("+198765432" + random.nextInt(9));
            customer.setStore(store);
            customers.add(customerRepository.save(customer));
        }

        // 6. Create Orders (Past 30 days)
        for (int i = 0; i < 50; i++) {
            Order order = new Order();
            Customer customer = customers.get(random.nextInt(customers.size()));
            order.setCustomer(customer);
            order.setStore(store);
            order.setCashier(owner);
            order.setPaymentType(PaymentType.values()[random.nextInt(PaymentType.values().length)]);

            // Random date in past 30 days
            LocalDateTime orderDate = LocalDateTime.now().minusDays(random.nextInt(30)).minusHours(random.nextInt(24));
            order.setCreatedAt(orderDate);
            order.setUpdatedAt(orderDate);

            // Add Order Items
            double totalAmount = 0.0;
            List<OrderItem> items = new ArrayList<>();
            int itemCount = 1 + random.nextInt(4);

            // Save order first to get ID for items
            Order savedOrder = orderRepository.save(order);

            for (int j = 0; j < itemCount; j++) {
                Product product = products.get(random.nextInt(products.size()));
                OrderItem item = new OrderItem();
                item.setProduct(product);
                item.setQuantity(1 + random.nextInt(3));
                item.setPrice(product.getSellingPrice());
                item.setOrder(savedOrder);

                totalAmount += (item.getPrice() * item.getQuantity());
                items.add(item);
            }

            orderItemRepository.saveAll(items);

            savedOrder.setTotalAmount(totalAmount);
            savedOrder.setItems(items);
            orderRepository.save(savedOrder);
        }

        log.info("Data seeding completed.");
    }
}

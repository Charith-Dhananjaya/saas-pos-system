package com.cdz.repository;

import com.cdz.model.Store;
import com.cdz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String username);
    List<User> findByStore(Store store);
}

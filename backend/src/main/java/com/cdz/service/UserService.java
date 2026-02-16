package com.cdz.service;

import com.cdz.exceptions.UserException;
import com.cdz.model.User;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;

public interface UserService {

    User getUserFromJwtToken(String token) throws UserException;

    User getCurrentUser() throws UserException;

    User getUserByEmail(String email) throws UserException;

    User getUserById(Long id) throws Exception;

    List<User> getAllUsers();

    User updateUserProfile(User user, String fullName, String phone, String password, MultipartFile imageFile)
            throws IOException;
}

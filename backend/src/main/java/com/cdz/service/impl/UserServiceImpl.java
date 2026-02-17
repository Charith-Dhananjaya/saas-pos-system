package com.cdz.service.impl;

import com.cdz.configuration.JwtProvider;
import com.cdz.exceptions.UserException;
import com.cdz.model.User;
import com.cdz.repository.UserRepository;
import com.cdz.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    public User getUserFromJwtToken(String token) throws UserException {

        String email = jwtProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("Invalid Token");
        }
        return user;
    }

    @Override
    public User getCurrentUser() throws UserException {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User Not Found");
        }
        return user;
    }

    @Override
    public User getUserByEmail(String email) throws UserException {

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User Not Found");
        }
        return user;
    }

    @Override
    public User getUserById(Long id) throws Exception {

        return userRepository.findById(id).orElseThrow(
                () -> new Exception("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public User updateUserProfile(User user, String fullName, String phone, String password,
            org.springframework.web.multipart.MultipartFile imageFile) throws java.io.IOException {
        if (fullName != null && !fullName.isEmpty()) {
            user.setFullName(fullName);
        }
        if (phone != null && !phone.isEmpty()) {
            user.setPhone(phone);
        }

        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String uploadDir = "uploads";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalFilename = imageFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = "profile_" + user.getId() + "_" + System.currentTimeMillis() + fileExtension;

            try (java.io.InputStream inputStream = imageFile.getInputStream()) {
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(inputStream, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                // Set the URL path (relative to server root)
                // Assuming the server serves static files from /uploads/**
                String fileUrl = "http://localhost:5000/uploads/" + fileName;
                user.setProfileImage(fileUrl);
            } catch (java.io.IOException ioe) {
                throw new java.io.IOException("Could not save image file: " + fileName, ioe);
            }
        }

        return userRepository.save(user);
    }

    @Override
    public void updateUserStore(User user, com.cdz.model.Store store) {
        user.setStore(store);
        userRepository.save(user);
    }
}

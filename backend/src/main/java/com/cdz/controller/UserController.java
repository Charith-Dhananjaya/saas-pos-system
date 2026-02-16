package com.cdz.controller;

import com.cdz.exceptions.UserException;
import com.cdz.mapper.UserMapper;
import com.cdz.model.User;
import com.cdz.payload.dto.UserDto;
import com.cdz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Returns the profile of the authenticated user")
    public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/profile", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update current user profile", description = "Updates the profile of the authenticated user")
    public ResponseEntity<User> updateUserProfile(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file)
            throws Exception {

        User user = userService.getUserFromJwtToken(jwt);
        User updatedUser = userService.updateUserProfile(user, fullName, phone, password, file);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) throws Exception {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toDTO(user));
    }
}

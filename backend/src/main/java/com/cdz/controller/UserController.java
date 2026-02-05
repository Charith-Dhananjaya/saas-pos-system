package com.cdz.controller;


import com.cdz.exceptions.UserException;
import com.cdz.mapper.UserMapper;
import com.cdz.model.User;
import com.cdz.payload.dto.UserDto;
import com.cdz.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile(
            @RequestHeader("Authorization") String jwt
    ) throws UserException {

        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(UserMapper.toDTO(user));

    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(
            @PathVariable Long id
    ) throws  Exception {

        User user = userService.getUserById(id);

        return ResponseEntity.ok(UserMapper.toDTO(user));

    }


}

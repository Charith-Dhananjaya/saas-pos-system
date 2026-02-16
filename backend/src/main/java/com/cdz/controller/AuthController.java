package com.cdz.controller;

import com.cdz.exceptions.UserException;
import com.cdz.payload.dto.UserDto;
import com.cdz.payload.response.AuthResponse;
import com.cdz.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login")
public class AuthController {
        private final AuthService authService;

        @PostMapping("/signup")
        @Operation(summary = "Register a new user", description = "Create a new owner or employee account and return a JWT token")
        public ResponseEntity<AuthResponse> signupHandler(
                        @RequestBody UserDto userDto) throws UserException {
                return ResponseEntity.ok(authService.signup(userDto));
        }

        @PostMapping("/login")
        @Operation(summary = "Login", description = "Authenticate with email and password, returns JWT token")
        public ResponseEntity<AuthResponse> loginHandler(
                        @RequestBody UserDto userDto) throws UserException {
                return ResponseEntity.ok(authService.login(userDto));
        }
}

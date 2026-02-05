package com.cdz.service;

import com.cdz.exceptions.UserException;
import com.cdz.payload.dto.UserDto;
import com.cdz.payload.response.AuthResponse;

public interface AuthService {

    AuthResponse signup(UserDto userDto) throws UserException;
    AuthResponse login(UserDto userDto) throws UserException;

}

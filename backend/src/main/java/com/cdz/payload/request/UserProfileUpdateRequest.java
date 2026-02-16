package com.cdz.payload.request;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String profileImage;
    private String password; // Optional
}

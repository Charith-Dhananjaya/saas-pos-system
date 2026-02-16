package com.cdz.configuration;

/**
 * JWT-related constants. The secret is now read from application.yml via @Value
 * in JwtProvider rather than being hardcoded here.
 */
public class JwtConstant {

    public static final String JWT_HEADER = "Authorization";

    private JwtConstant() {
        // utility class
    }
}

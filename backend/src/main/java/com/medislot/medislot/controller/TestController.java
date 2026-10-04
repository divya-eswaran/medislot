package com.medislot.medislot.controller;

import com.medislot.medislot.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> test() {
        return ResponseEntity.ok(ApiResponse.success("MediSlot API is working smoothly!", Map.of(
                "status", "UP",
                "application", "MediSlot Healthcare Management System",
                "version", "1.0.0",
                "timestamp", System.currentTimeMillis()
        )));
    }
}

package com.medislot.medislot.controller;

import com.medislot.medislot.dto.ApiResponse;
import com.medislot.medislot.dto.NotificationDto;
import com.medislot.medislot.security.SecurityUtil;
import com.medislot.medislot.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notificationService.getUserNotifications(email)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        String email = SecurityUtil.getCurrentUserEmail();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        String email = SecurityUtil.getCurrentUserEmail();
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        String email = SecurityUtil.getCurrentUserEmail();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.success("All marked as read"));
    }
}

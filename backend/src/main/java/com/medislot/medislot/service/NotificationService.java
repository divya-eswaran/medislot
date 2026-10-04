package com.medislot.medislot.service;

import com.medislot.medislot.dto.NotificationDto;
import com.medislot.medislot.entity.Notification;
import com.medislot.medislot.entity.User;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.NotificationRepository;
import com.medislot.medislot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(User user, String title, String message, String type) {
        if (user == null) return;
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    public List<NotificationDto> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    private NotificationDto mapToDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}

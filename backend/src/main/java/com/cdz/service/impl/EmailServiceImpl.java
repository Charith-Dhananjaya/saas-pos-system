package com.cdz.service.impl;

import com.cdz.model.Inventory;
import com.cdz.model.Store;
import com.cdz.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    @Override
    public void sendEmail(String to, String subject, String content, boolean isHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, isHtml);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            // We don't rethrow to avoid breaking the calling transaction (e.g. order
            // creation)
        }
    }

    @Override
    public void sendLowStockAlert(Store store, List<Inventory> lowStockItems) {
        if (store.getContact() == null || store.getContact().getEmail() == null
                || store.getContact().getEmail().isEmpty()) {
            log.warn("Cannot send low stock alert: Store {} has no email address", store.getBrand());
            return;
        }

        Context context = new Context();
        context.setVariable("storeName", store.getBrand());
        context.setVariable("items", lowStockItems);

        // You would typically generate this link dynamically based on your frontend URL
        context.setVariable("inventoryLink", "http://localhost:5173/inventory");

        String htmlContent = templateEngine.process("email/low-stock-alert", context);

        sendEmail(store.getContact().getEmail(), "Low Stock Alert - " + store.getBrand(), htmlContent, true);
    }
}

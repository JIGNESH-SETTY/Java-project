package com.airesearch.discovery.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Public ping & health endpoints for uptime monitors (e.g. UptimeRobot)
 * and cloud load balancer health checks.
 */
@RestController
public class HealthCheckController {

    @GetMapping(value = {"/", "/health", "/ping", "/api/v1/health"})
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Research Discovery Engine",
                "timestamp", Instant.now().toString()
        ));
    }
}


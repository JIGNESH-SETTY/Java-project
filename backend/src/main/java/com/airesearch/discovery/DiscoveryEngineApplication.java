package com.airesearch.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application entry point for AI Research Discovery and Evidence Engine.
 */
@SpringBootApplication
@EnableAsync
public class DiscoveryEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryEngineApplication.class, args);
    }
}

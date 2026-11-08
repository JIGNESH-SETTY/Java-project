package com.airesearch.discovery.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Automatically converts cloud-injected DATABASE_URL or INTERNAL_DATABASE_URL
 * (e.g. from Render, Railway, Supabase, Neon) into Spring Boot PostgreSQL JDBC properties.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = environment.getProperty("INTERNAL_DATABASE_URL");
        }

        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        // If it's already a full JDBC URL, assign directly
        if (databaseUrl.startsWith("jdbc:")) {
            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", databaseUrl);
            props.put("spring.flyway.url", databaseUrl);
            environment.getPropertySources().addFirst(new MapPropertySource("render-database-url", props));
            return;
        }

        try {
            // Standardize postgres:// to postgresql:// for standard Java URI parsing
            String cleanUrl = databaseUrl.trim();
            if (cleanUrl.startsWith("postgres://")) {
                cleanUrl = "postgresql://" + cleanUrl.substring("postgres://".length());
            }

            URI uri = URI.create(cleanUrl);
            String host = uri.getHost();
            int port = uri.getPort() != -1 ? uri.getPort() : 5432;
            String path = uri.getPath(); // /dbname
            String query = uri.getQuery();

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                    .append(host)
                    .append(":")
                    .append(port)
                    .append(path != null ? path : "");

            if (query != null && !query.isBlank()) {
                jdbcUrl.append("?").append(query);
            }

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl.toString());
            props.put("spring.flyway.url", jdbcUrl.toString());

            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                props.put("spring.datasource.username", parts[0]);
                props.put("spring.datasource.password", parts[1]);
                props.put("spring.flyway.user", parts[0]);
                props.put("spring.flyway.password", parts[1]);
            }

            environment.getPropertySources().addFirst(new MapPropertySource("render-database-url", props));
            log.info("Converted cloud DATABASE_URL to JDBC datasource: {}:{}", host, port);
        } catch (Exception e) {
            log.warn("Could not parse cloud DATABASE_URL ('{}'): {}", databaseUrl, e.getMessage());
        }
    }
}


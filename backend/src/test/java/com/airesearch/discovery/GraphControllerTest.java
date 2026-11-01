package com.airesearch.discovery;

import com.airesearch.discovery.auth.dto.RegisterRequest;
import com.airesearch.discovery.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GraphControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        String testEmail = "graphtest_" + System.currentTimeMillis() + "@airesearch.edu";
        var authRes = authService.register(new RegisterRequest(testEmail, "password123", "Graph Tester", com.airesearch.discovery.shared.enums.UserRole.ROLE_USER));
        this.jwtToken = authRes.accessToken();
    }

    @Test
    @DisplayName("Unauthenticated request to citation graph must be rejected with 403 Forbidden")
    void testCitationGraphUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/graphs/citations"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to concept graph must be rejected with 403 Forbidden")
    void testConceptGraphUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/graphs/concepts"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authenticated user can query citation graph with filtering parameters")
    void testCitationGraphSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/graphs/citations")
                        .header("Authorization", "Bearer " + jwtToken)
                        .param("limit", "50")
                        .param("importedOnly", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nodes", notNullValue()))
                .andExpect(jsonPath("$.edges", notNullValue()))
                .andExpect(jsonPath("$.metadata.totalNodes", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.metadata.totalEdges", greaterThanOrEqualTo(0)));
    }

    @Test
    @DisplayName("Authenticated user can query concept and claim evidence graph")
    void testConceptGraphSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/graphs/concepts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .param("limit", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nodes", notNullValue()))
                .andExpect(jsonPath("$.edges", notNullValue()))
                .andExpect(jsonPath("$.metadata.totalNodes", greaterThanOrEqualTo(0)));
    }

    @Test
    @DisplayName("Querying non-existent node returns 404")
    void testNodeDetailsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/graphs/nodes/paper:00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
}

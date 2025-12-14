package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for User endpoints
 * Tests the full stack with real database
 */
@SpringBootTest
@AutoConfigureMockMvc
public class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private User testUser;

    @BeforeEach
    public void setup() throws Exception {
        // Clean database
        userRepository.deleteAll();

        // Create test user
        testUser = User.builder()
                .email("test@test.com")
                .lastName("Doe")
                .firstName("John")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);

        // Login to get JWT token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        jwtToken = objectMapper.readTree(response).get("token").asText();
    }

    @AfterEach
    public void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    public void testFindUserById() throws Exception {
        // When
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false));

        // Verify user still exists in database
        assertThat(userRepository.findById(testUser.getId())).isPresent();
    }

    @Test
    public void testFindUserById_NotFound() throws Exception {
        // When
        mockMvc.perform(get("/api/user/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteUser_Success() throws Exception {
        // When - Delete own account
        mockMvc.perform(delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Verify user was deleted from database
        assertThat(userRepository.findById(testUser.getId())).isEmpty();
    }

    @Test
    public void testDeleteUser_Unauthorized() throws Exception {
        // Create another user
        User otherUser = User.builder()
                .email("other@test.com")
                .lastName("Smith")
                .firstName("Jane")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        otherUser = userRepository.save(otherUser);

        // When - Try to delete another user's account
        mockMvc.perform(delete("/api/user/" + otherUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isUnauthorized());

        // Verify other user was NOT deleted
        assertThat(userRepository.findById(otherUser.getId())).isPresent();
    }

    @Test
    public void testDeleteUser_NotFound() throws Exception {
        // When - Try to delete non-existent user
        mockMvc.perform(delete("/api/user/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testAccessWithoutAuthentication() throws Exception {
        // When - Try to access without JWT token
        mockMvc.perform(get("/api/user/" + testUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testCompleteUserLifecycle() throws Exception {
        // 1. Verify user exists
        assertThat(userRepository.findByEmail("test@test.com")).isPresent();

        // 2. Get user details
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"));

        // 3. Delete user account
        mockMvc.perform(delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // 4. Verify user no longer exists
        assertThat(userRepository.findByEmail("test@test.com")).isEmpty();

        // 5. Try to access deleted user - JWT is now invalid, so we get Unauthorized
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isUnauthorized());
    }
}

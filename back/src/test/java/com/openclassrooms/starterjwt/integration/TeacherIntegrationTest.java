package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Integration test for Teacher endpoints
 * Tests the full stack with real database
 */
@SpringBootTest
@AutoConfigureMockMvc
public class TeacherIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Teacher teacher1;
    private Teacher teacher2;

    @BeforeEach
    public void setup() throws Exception {
        // Clean database
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        // Create test teachers
        teacher1 = Teacher.builder()
                .lastName("Smith")
                .firstName("Jane")
                .build();
        teacher1 = teacherRepository.save(teacher1);

        teacher2 = Teacher.builder()
                .lastName("Johnson")
                .firstName("Bob")
                .build();
        teacher2 = teacherRepository.save(teacher2);

        // Create test user and login
        User testUser = User.builder()
                .email("test@test.com")
                .lastName("Doe")
                .firstName("John")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        userRepository.save(testUser);

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
        teacherRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testFindAllTeachers() throws Exception {
        // When
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].lastName").value("Smith"))
                .andExpect(jsonPath("$[0].firstName").value("Jane"))
                .andExpect(jsonPath("$[1].lastName").value("Johnson"))
                .andExpect(jsonPath("$[1].firstName").value("Bob"));

        // Verify in database
        assertThat(teacherRepository.findAll()).hasSize(2);
    }

    @Test
    public void testFindTeacherById() throws Exception {
        // When
        mockMvc.perform(get("/api/teacher/" + teacher1.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher1.getId()))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    public void testFindTeacherById_NotFound() throws Exception {
        // When
        mockMvc.perform(get("/api/teacher/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testFindTeacherById_InvalidId() throws Exception {
        // When
        mockMvc.perform(get("/api/teacher/invalid")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testAccessWithoutAuthentication() throws Exception {
        // When - Try to access without JWT token
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}

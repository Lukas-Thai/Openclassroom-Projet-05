package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.SessionRepository;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for Session management
 * Tests the full stack: Controller -> Service -> Repository -> Database
 * Uses real dependencies, no mocks
 */
@SpringBootTest
@AutoConfigureMockMvc
public class SessionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private User testUser;
    private Teacher testTeacher;

    @BeforeEach
    public void setup() throws Exception {
        // Clean database
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        // Create test teacher
        testTeacher = Teacher.builder()
                .lastName("Smith")
                .firstName("Jane")
                .build();
        testTeacher = teacherRepository.save(testTeacher);

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
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    public void testCompleteSessionFlow() throws Exception {
        // 1. Create a session
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Yoga Integration Test");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Full stack integration test for session");
        sessionDto.setTeacher_id(testTeacher.getId());

        MvcResult createResult = mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Integration Test"))
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Long sessionId = objectMapper.readTree(createResponse).get("id").asLong();

        // Verify session was saved in database
        Session savedSession = sessionRepository.findById(sessionId).orElse(null);
        assertThat(savedSession).isNotNull();
        assertThat(savedSession.getName()).isEqualTo("Yoga Integration Test");

        // 2. Get all sessions
        mockMvc.perform(get("/api/session")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Yoga Integration Test"));

        // 3. Get session by ID
        mockMvc.perform(get("/api/session/" + sessionId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId))
                .andExpect(jsonPath("$.name").value("Yoga Integration Test"));

        // 4. Update session
        sessionDto.setId(sessionId);
        sessionDto.setName("Updated Yoga Session");

        mockMvc.perform(put("/api/session/" + sessionId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Yoga Session"));

        // Verify update in database
        Session updatedSession = sessionRepository.findById(sessionId).orElse(null);
        assertThat(updatedSession).isNotNull();
        assertThat(updatedSession.getName()).isEqualTo("Updated Yoga Session");

        // 5. User participates in session
        mockMvc.perform(post("/api/session/" + sessionId + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Verify participation in database
        Session sessionWithParticipant = sessionRepository.findById(sessionId).orElse(null);
        assertThat(sessionWithParticipant).isNotNull();
        assertThat(sessionWithParticipant.getUsers()).hasSize(1);
        assertThat(sessionWithParticipant.getUsers().get(0).getId()).isEqualTo(testUser.getId());

        // 6. User stops participating
        mockMvc.perform(delete("/api/session/" + sessionId + "/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Verify no more participation in database
        Session sessionWithoutParticipant = sessionRepository.findById(sessionId).orElse(null);
        assertThat(sessionWithoutParticipant).isNotNull();
        assertThat(sessionWithoutParticipant.getUsers()).isEmpty();

        // 7. Delete session
        mockMvc.perform(delete("/api/session/" + sessionId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Verify deletion in database
        boolean exists = sessionRepository.existsById(sessionId);
        assertThat(exists).isFalse();
    }

    @Test
    public void testParticipateErrors() throws Exception {
        // Create session
        Session session = Session.builder()
                .name("Test Session")
                .date(new Date())
                .description("Test")
                .teacher(testTeacher)
                .build();
        session = sessionRepository.save(session);

        // Test participate with non-existent user
        mockMvc.perform(post("/api/session/" + session.getId() + "/participate/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());

        // Test participate with non-existent session
        mockMvc.perform(post("/api/session/999/participate/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testSessionNotFound() throws Exception {
        mockMvc.perform(get("/api/session/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/session/999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
}

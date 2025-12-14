package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private SessionMapper sessionMapper;

    private Session session;
    private SessionDto sessionDto;

    @BeforeEach
    public void setup() {
        session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("A relaxing yoga session")
                .teacher(Teacher.builder().id(1L).build())
                .build();

        sessionDto = new SessionDto();
        sessionDto.setId(1L);
        sessionDto.setName("Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("A relaxing yoga session");
        sessionDto.setTeacher_id(1L);
    }

    @Test
    public void testFindById_Success() throws Exception {
        when(sessionService.getById(1L)).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        mockMvc.perform(get("/api/session/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Yoga Session"));

        verify(sessionService, times(1)).getById(1L);
        verify(sessionMapper, times(1)).toDto(session);
    }

    @Test
    public void testFindById_NotFound() throws Exception {
        when(sessionService.getById(anyLong())).thenReturn(null);

        mockMvc.perform(get("/api/session/99"))
                .andExpect(status().isNotFound());

        verify(sessionService, times(1)).getById(99L);
        verify(sessionMapper, never()).toDto(any(Session.class));
    }

    @Test
    public void testFindById_InvalidId() throws Exception {
        mockMvc.perform(get("/api/session/invalid"))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).getById(anyLong());
    }

    @Test
    public void testFindAll() throws Exception {
        Session session2 = Session.builder()
                .id(2L)
                .name("Pilates Session")
                .date(new Date())
                .description("Pilates class")
                .build();

        SessionDto sessionDto2 = new SessionDto();
        sessionDto2.setId(2L);
        sessionDto2.setName("Pilates Session");

        List<Session> sessions = Arrays.asList(session, session2);
        List<SessionDto> sessionDtos = Arrays.asList(sessionDto, sessionDto2);

        when(sessionService.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Yoga Session"))
                .andExpect(jsonPath("$[1].name").value("Pilates Session"));

        verify(sessionService, times(1)).findAll();
    }

    @Test
    public void testCreate() throws Exception {
        when(sessionMapper.toEntity(any(SessionDto.class))).thenReturn(session);
        when(sessionService.create(any(Session.class))).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Yoga Session"));

        verify(sessionService, times(1)).create(any(Session.class));
    }

    @Test
    public void testUpdate_Success() throws Exception {
        when(sessionMapper.toEntity(any(SessionDto.class))).thenReturn(session);
        when(sessionService.update(anyLong(), any(Session.class))).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        mockMvc.perform(put("/api/session/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Yoga Session"));

        verify(sessionService, times(1)).update(eq(1L), any(Session.class));
    }

    @Test
    public void testUpdate_InvalidId() throws Exception {
        mockMvc.perform(put("/api/session/invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).update(anyLong(), any(Session.class));
    }

    @Test
    public void testDelete_Success() throws Exception {
        when(sessionService.getById(1L)).thenReturn(session);
        doNothing().when(sessionService).delete(1L);

        mockMvc.perform(delete("/api/session/1"))
                .andExpect(status().isOk());

        verify(sessionService, times(1)).getById(1L);
        verify(sessionService, times(1)).delete(1L);
    }

    @Test
    public void testDelete_NotFound() throws Exception {
        when(sessionService.getById(anyLong())).thenReturn(null);

        mockMvc.perform(delete("/api/session/99"))
                .andExpect(status().isNotFound());

        verify(sessionService, times(1)).getById(99L);
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    public void testDelete_InvalidId() throws Exception {
        mockMvc.perform(delete("/api/session/invalid"))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).getById(anyLong());
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    public void testParticipate_Success() throws Exception {
        doNothing().when(sessionService).participate(1L, 1L);

        mockMvc.perform(post("/api/session/1/participate/1"))
                .andExpect(status().isOk());

        verify(sessionService, times(1)).participate(1L, 1L);
    }

    @Test
    public void testParticipate_InvalidId() throws Exception {
        mockMvc.perform(post("/api/session/invalid/participate/1"))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).participate(anyLong(), anyLong());
    }

    @Test
    public void testNoLongerParticipate_Success() throws Exception {
        doNothing().when(sessionService).noLongerParticipate(1L, 1L);

        mockMvc.perform(delete("/api/session/1/participate/1"))
                .andExpect(status().isOk());

        verify(sessionService, times(1)).noLongerParticipate(1L, 1L);
    }

    @Test
    public void testNoLongerParticipate_InvalidId() throws Exception {
        mockMvc.perform(delete("/api/session/invalid/participate/1"))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
    }
}

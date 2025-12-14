package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeacherService teacherService;

    @MockBean
    private TeacherMapper teacherMapper;

    private Teacher teacher;
    private TeacherDto teacherDto;

    @BeforeEach
    public void setup() {
        teacher = Teacher.builder()
                .id(1L)
                .lastName("Smith")
                .firstName("Jane")
                .build();

        teacherDto = new TeacherDto();
        teacherDto.setId(1L);
        teacherDto.setLastName("Smith");
        teacherDto.setFirstName("Jane");
    }

    @Test
    @WithMockUser
    public void testFindById_Success() throws Exception {
        when(teacherService.findById(1L)).thenReturn(teacher);
        when(teacherMapper.toDto(teacher)).thenReturn(teacherDto);

        mockMvc.perform(get("/api/teacher/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"));

        verify(teacherService, times(1)).findById(1L);
        verify(teacherMapper, times(1)).toDto(teacher);
    }

    @Test
    @WithMockUser
    public void testFindById_NotFound() throws Exception {
        when(teacherService.findById(anyLong())).thenReturn(null);

        mockMvc.perform(get("/api/teacher/99"))
                .andExpect(status().isNotFound());

        verify(teacherService, times(1)).findById(99L);
        verify(teacherMapper, never()).toDto(any(Teacher.class));
    }

    @Test
    @WithMockUser
    public void testFindById_InvalidId() throws Exception {
        mockMvc.perform(get("/api/teacher/invalid"))
                .andExpect(status().isBadRequest());

        verify(teacherService, never()).findById(anyLong());
    }

    @Test
    @WithMockUser
    public void testFindAll() throws Exception {
        Teacher teacher2 = Teacher.builder()
                .id(2L)
                .lastName("Doe")
                .firstName("John")
                .build();

        TeacherDto teacherDto2 = new TeacherDto();
        teacherDto2.setId(2L);
        teacherDto2.setLastName("Doe");
        teacherDto2.setFirstName("John");

        List<Teacher> teachers = Arrays.asList(teacher, teacher2);
        List<TeacherDto> teacherDtos = Arrays.asList(teacherDto, teacherDto2);

        when(teacherService.findAll()).thenReturn(teachers);
        when(teacherMapper.toDto(teachers)).thenReturn(teacherDtos);

        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].firstName").value("Jane"))
                .andExpect(jsonPath("$[1].firstName").value("John"));

        verify(teacherService, times(1)).findAll();
    }
}

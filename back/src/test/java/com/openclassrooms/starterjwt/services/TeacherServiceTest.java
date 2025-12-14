package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher;

    @BeforeEach
    public void setup() {
        teacher = Teacher.builder()
                .id(1L)
                .lastName("Smith")
                .firstName("Jane")
                .build();
    }

    @Test
    public void testFindAll() {
        Teacher teacher2 = Teacher.builder()
                .id(2L)
                .lastName("Doe")
                .firstName("John")
                .build();

        when(teacherRepository.findAll()).thenReturn(Arrays.asList(teacher, teacher2));

        List<Teacher> teachers = teacherService.findAll();

        assertThat(teachers).hasSize(2);
        assertThat(teachers.get(0).getFirstName()).isEqualTo("Jane");
        assertThat(teachers.get(0).getLastName()).isEqualTo("Smith");
        assertThat(teachers.get(1).getFirstName()).isEqualTo("John");
        assertThat(teachers.get(1).getLastName()).isEqualTo("Doe");
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    public void testFindById_Found() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Teacher found = teacherService.findById(1L);

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(1L);
        assertThat(found.getFirstName()).isEqualTo("Jane");
        assertThat(found.getLastName()).isEqualTo("Smith");
        verify(teacherRepository, times(1)).findById(1L);
    }

    @Test
    public void testFindById_NotFound() {
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.empty());

        Teacher found = teacherService.findById(99L);

        assertThat(found).isNull();
        verify(teacherRepository, times(1)).findById(99L);
    }
}

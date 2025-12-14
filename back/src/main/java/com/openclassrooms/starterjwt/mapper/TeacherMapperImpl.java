package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TeacherMapperImpl implements TeacherMapper {

    @Override
    public TeacherDto toDto(Teacher teacher) {
        if (teacher == null) {
            return null;
        }

        TeacherDto teacherDto = new TeacherDto();
        teacherDto.setId(teacher.getId());
        teacherDto.setLastName(teacher.getLastName());
        teacherDto.setFirstName(teacher.getFirstName());
        teacherDto.setCreatedAt(teacher.getCreatedAt());
        teacherDto.setUpdatedAt(teacher.getUpdatedAt());

        return teacherDto;
    }

    @Override
    public List<TeacherDto> toDto(List<Teacher> teachers) {
        if (teachers == null) {
            return null;
        }
        return teachers.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Teacher toEntity(TeacherDto teacherDto) {
        if (teacherDto == null) {
            return null;
        }

        Teacher teacher = new Teacher();
        teacher.setId(teacherDto.getId());
        teacher.setLastName(teacherDto.getLastName());
        teacher.setFirstName(teacherDto.getFirstName());

        return teacher;
    }

    @Override
    public List<Teacher> toEntity(List<TeacherDto> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream()
            .map(this::toEntity)
            .collect(Collectors.toList());
    }
}

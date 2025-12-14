package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SessionMapperImpl implements SessionMapper {

    private final TeacherService teacherService;
    private final UserService userService;

    public SessionMapperImpl(TeacherService teacherService, UserService userService) {
        this.teacherService = teacherService;
        this.userService = userService;
    }

    @Override
    public SessionDto toDto(Session session) {
        if (session == null) {
            return null;
        }

        SessionDto sessionDto = new SessionDto();
        sessionDto.setId(session.getId());
        sessionDto.setName(session.getName());
        sessionDto.setDate(session.getDate());
        sessionDto.setDescription(session.getDescription());

        if (session.getTeacher() != null) {
            sessionDto.setTeacher_id(session.getTeacher().getId());
        }

        if (session.getUsers() != null) {
            sessionDto.setUsers(session.getUsers().stream()
                .map(User::getId)
                .collect(Collectors.toList()));
        }

        sessionDto.setCreatedAt(session.getCreatedAt());
        sessionDto.setUpdatedAt(session.getUpdatedAt());

        return sessionDto;
    }

    @Override
    public List<SessionDto> toDto(List<Session> sessions) {
        if (sessions == null) {
            return null;
        }
        return sessions.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Session toEntity(SessionDto sessionDto) {
        if (sessionDto == null) {
            return null;
        }

        Session session = new Session();
        session.setId(sessionDto.getId());
        session.setName(sessionDto.getName());
        session.setDate(sessionDto.getDate());
        session.setDescription(sessionDto.getDescription());

        if (sessionDto.getTeacher_id() != null) {
            Teacher teacher = teacherService.findById(sessionDto.getTeacher_id());
            session.setTeacher(teacher);
        }

        if (sessionDto.getUsers() != null) {
            List<User> users = new ArrayList<>();
            for (Long userId : sessionDto.getUsers()) {
                User user = userService.findById(userId);
                if (user != null) {
                    users.add(user);
                }
            }
            session.setUsers(users);
        }

        return session;
    }

    @Override
    public List<Session> toEntity(List<SessionDto> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream()
            .map(this::toEntity)
            .collect(Collectors.toList());
    }
}

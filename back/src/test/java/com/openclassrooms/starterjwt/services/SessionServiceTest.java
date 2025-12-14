package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    public void setup() {
        user = User.builder()
                .id(1L)
                .email("test@test.com")
                .lastName("Doe")
                .firstName("John")
                .password("password")
                .admin(false)
                .build();

        session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("A relaxing yoga session")
                .teacher(Teacher.builder().id(1L).build())
                .users(new ArrayList<>())
                .build();
    }

    @Test
    public void testCreate() {
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        Session created = sessionService.create(session);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(1L);
        assertThat(created.getName()).isEqualTo("Yoga Session");
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    public void testDelete() {
        doNothing().when(sessionRepository).deleteById(anyLong());

        sessionService.delete(1L);

        verify(sessionRepository, times(1)).deleteById(1L);
    }

    @Test
    public void testFindAll() {
        Session session2 = Session.builder()
                .id(2L)
                .name("Pilates Session")
                .date(new Date())
                .description("Pilates class")
                .build();

        when(sessionRepository.findAll()).thenReturn(Arrays.asList(session, session2));

        List<Session> sessions = sessionService.findAll();

        assertThat(sessions).hasSize(2);
        assertThat(sessions.get(0).getName()).isEqualTo("Yoga Session");
        assertThat(sessions.get(1).getName()).isEqualTo("Pilates Session");
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    public void testGetById_Found() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        Session found = sessionService.getById(1L);

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(1L);
        assertThat(found.getName()).isEqualTo("Yoga Session");
        verify(sessionRepository, times(1)).findById(1L);
    }

    @Test
    public void testUpdate() {
        Session updatedSession = Session.builder()
                .id(1L)
                .name("Updated Yoga Session")
                .date(new Date())
                .description("Updated description")
                .build();

        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        Session result = sessionService.update(1L, updatedSession);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Updated Yoga Session");
        verify(sessionRepository, times(1)).save(updatedSession);
    }

    @Test
    public void testParticipate_Success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        sessionService.participate(1L, 1L);

        assertThat(session.getUsers()).contains(user);
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    public void testParticipate_UserNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(1L, 99L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(99L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    public void testParticipate_AlreadyParticipating() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    public void testNoLongerParticipate_Success() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        sessionService.noLongerParticipate(1L, 1L);

        assertThat(session.getUsers()).doesNotContain(user);
        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    public void testNoLongerParticipate_NotParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any());
    }
}

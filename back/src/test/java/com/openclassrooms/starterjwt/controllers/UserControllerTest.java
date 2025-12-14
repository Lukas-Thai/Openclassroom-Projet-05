package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserMapper userMapper;

    private User user;
    private UserDto userDto;

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

        userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("test@test.com");
        userDto.setLastName("Doe");
        userDto.setFirstName("John");
        userDto.setAdmin(false);
    }

    @Test
    @WithMockUser
    public void testFindById_Success() throws Exception {
        when(userService.findById(1L)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDto);

        mockMvc.perform(get("/api/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"));

        verify(userService, times(1)).findById(1L);
        verify(userMapper, times(1)).toDto(user);
    }

    @Test
    @WithMockUser
    public void testFindById_NotFound() throws Exception {
        when(userService.findById(anyLong())).thenReturn(null);

        mockMvc.perform(get("/api/user/99"))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).findById(99L);
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    @WithMockUser
    public void testFindById_InvalidId() throws Exception {
        mockMvc.perform(get("/api/user/invalid"))
                .andExpect(status().isBadRequest());

        verify(userService, never()).findById(anyLong());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    public void testDelete_Success() throws Exception {
        when(userService.findById(1L)).thenReturn(user);
        doNothing().when(userService).delete(1L);

        mockMvc.perform(delete("/api/user/1"))
                .andExpect(status().isOk());

        verify(userService, times(1)).findById(1L);
        verify(userService, times(1)).delete(1L);
    }

    @Test
    @WithMockUser(username = "other@test.com")
    public void testDelete_Unauthorized() throws Exception {
        when(userService.findById(1L)).thenReturn(user);

        mockMvc.perform(delete("/api/user/1"))
                .andExpect(status().isUnauthorized());

        verify(userService, times(1)).findById(1L);
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @WithMockUser
    public void testDelete_NotFound() throws Exception {
        when(userService.findById(anyLong())).thenReturn(null);

        mockMvc.perform(delete("/api/user/99"))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).findById(99L);
        verify(userService, never()).delete(anyLong());
    }

    @Test
    @WithMockUser
    public void testDelete_InvalidId() throws Exception {
        mockMvc.perform(delete("/api/user/invalid"))
                .andExpect(status().isBadRequest());

        verify(userService, never()).findById(anyLong());
        verify(userService, never()).delete(anyLong());
    }
}

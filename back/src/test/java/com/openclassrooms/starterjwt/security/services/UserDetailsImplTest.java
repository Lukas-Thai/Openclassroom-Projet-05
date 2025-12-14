package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for UserDetailsImpl - focuses on equals() logic
 */
public class UserDetailsImplTest {

    private UserDetailsImpl userDetails1;
    private UserDetailsImpl userDetails2;
    private UserDetailsImpl userDetails3;

    @BeforeEach
    public void setup() {
        userDetails1 = UserDetailsImpl.builder()
                .id(1L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        userDetails2 = UserDetailsImpl.builder()
                .id(1L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        userDetails3 = UserDetailsImpl.builder()
                .id(2L)
                .username("other@test.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("password")
                .admin(true)
                .build();
    }

    @Test
    public void testEquals_SameObject() {
        assertThat(userDetails1.equals(userDetails1)).isTrue();
    }

    @Test
    public void testEquals_EqualObjects() {
        assertThat(userDetails1.equals(userDetails2)).isTrue();
        assertThat(userDetails2.equals(userDetails1)).isTrue();
    }

    @Test
    public void testEquals_DifferentObjects() {
        assertThat(userDetails1.equals(userDetails3)).isFalse();
    }

    @Test
    public void testEquals_Null() {
        assertThat(userDetails1.equals(null)).isFalse();
    }

    @Test
    public void testEquals_DifferentClass() {
        assertThat(userDetails1.equals("string")).isFalse();
    }
}

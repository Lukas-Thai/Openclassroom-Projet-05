package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setLastName(user.getLastName());
        userDto.setFirstName(user.getFirstName());
        userDto.setAdmin(user.isAdmin());
        userDto.setPassword(user.getPassword());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        return userDto;
    }

    @Override
    public List<UserDto> toDto(List<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public User toEntity(UserDto userDto) {
        if (userDto == null) {
            return null;
        }

        User user = new User();
        user.setId(userDto.getId());
        user.setEmail(userDto.getEmail());
        user.setLastName(userDto.getLastName());
        user.setFirstName(userDto.getFirstName());
        user.setAdmin(userDto.isAdmin());
        user.setPassword(userDto.getPassword());

        return user;
    }

    @Override
    public List<User> toEntity(List<UserDto> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream()
            .map(this::toEntity)
            .collect(Collectors.toList());
    }
}

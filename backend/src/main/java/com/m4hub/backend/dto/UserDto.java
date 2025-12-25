package com.m4hub.backend.dto;

public class UserDto {
    private Long id;
    private String phoneNumber;
    private String email;
    private String username;
    private String name;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private Boolean isVerified;
    private Boolean isActive;

    public UserDto() {
    }

    public UserDto(Long id, String phoneNumber, String email, String username, String name, String firstName,
            String lastName, String dateOfBirth, String gender, Boolean isVerified, Boolean isActive) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.username = username;
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.isVerified = isVerified;
        this.isActive = isActive;
    }

    public static UserDto fromEntity(com.m4hub.backend.model.User user) {
        if (user == null)
            return null;
        return new UserDto(
                user.getId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getGender(),
                user.getIsVerified(),
                user.getIsActive());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

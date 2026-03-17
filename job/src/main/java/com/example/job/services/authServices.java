package com.example.job.services;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.example.job.models.Role;
import com.example.job.models.authuser;
import com.example.job.repository.authrepo;
import com.example.job.utils.jwUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class authServices {

    private final authrepo authUserRepo;
    private final PasswordEncoder passwordEncoder;
    private final jwUtil jwtUtil;

    /*public authServices(authrepo authUserRepo, PasswordEncoder passwordEncoder, jwUtil jwtUtil) {
        this.authUserRepo = authUserRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }*/

    // EMPLOYER REGISTER
    public ResponseEntity<?> registerEmployer(Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("username and password required");
        }

        if (authUserRepo.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        authuser user = new authuser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.EMPLOYER);

        authUserRepo.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Employer Registered Successfully");
    }

    // JOBSEEKER REGISTER
    public ResponseEntity<?> registerJobSeeker(Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("username and password required");
        }

        if (authUserRepo.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        authuser user = new authuser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.JOBSEEKER);

        authUserRepo.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("JobSeeker Registered Successfully");
    }

    // LOGIN (SAME FOR BOTH)
    public ResponseEntity<?> login(Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("username and password required");
        }

        Optional<authuser> userOptional = authUserRepo.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username");
        }

        authuser user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole().name()
        ));
    }
}

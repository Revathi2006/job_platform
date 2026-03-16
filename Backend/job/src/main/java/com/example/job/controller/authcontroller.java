package com.example.job.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.job.services.authServices;

@RestController
@RequestMapping("/auth")
public class authcontroller {

    @Autowired
    private authServices authService;

    
    // EMPLOYER REGISTER
    @PostMapping("/employer/register")
    public ResponseEntity<?> registerEmployer(@RequestBody Map<String, String> body) {
        return authService.registerEmployer(body);
    }

    // JOBSEEKER REGISTER
    @PostMapping("/jobseeker/register")
    public ResponseEntity<?> registerJobSeeker(@RequestBody Map<String, String> body) {
        return authService.registerJobSeeker(body);
    }

    // LOGIN (ONE FOR BOTH)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return authService.login(body);
    }
}

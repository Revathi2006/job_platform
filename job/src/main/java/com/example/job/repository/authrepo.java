package com.example.job.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.job.models.authuser;

public interface authrepo extends JpaRepository<authuser, Long> {
    Optional<authuser> findByUsername(String username);
    boolean existsByUsername(String username);
}

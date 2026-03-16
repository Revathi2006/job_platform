package com.example.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.job.models.employerdb;

public interface  employerRepo extends JpaRepository<employerdb, Integer>{
    
    List<employerdb> findByEmpLoc(String empLoc);

    List<employerdb> findByEmail(String email);

    List<employerdb> findByEmpcomname(String empcomname);

    List<employerdb> findByEmpcomnameAndEmpLoc(String empcomname, String empLoc);
}

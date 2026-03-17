package com.example.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.job.models.jobdb;
public interface  jobRepo extends JpaRepository<jobdb, Integer> {
    List<jobdb> findByJobloc(String jobloc);

    List<jobdb> findByJobtittle(String jobtittle);

    List<jobdb> findByEmployer_Emid(Integer emid);
}

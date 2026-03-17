package com.example.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.job.models.jobseekerdb;

public interface jobseekerRepo extends JpaRepository<jobseekerdb, Integer>{
     List<jobseekerdb> findByJobseekername(String jobseekername);

    List<jobseekerdb> findByJobseekeremail(String jobseekeremail);
}

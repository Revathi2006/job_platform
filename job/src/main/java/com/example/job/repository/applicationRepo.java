package com.example.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.job.models.applicationdb;

@Repository
public interface applicationRepo extends JpaRepository<applicationdb, Integer> {

    List<applicationdb> findByJob_Jobid(Integer jobid);

    List<applicationdb> findByJobseeker_Jobseekerid(Integer jobseekerid);

    List<applicationdb> findByStatus(String status);

    boolean existsByJob_JobidAndJobseeker_Jobseekerid(Integer jobid, Integer jobseekerid);

    long countByJob_Jobid(Integer jobid);
}

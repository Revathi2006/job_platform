package com.example.job.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.job.models.applicationdb;
import com.example.job.services.applicationSer;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/application")
@RequiredArgsConstructor
public class applicationCon {

    private final applicationSer appser;

    @PostMapping("/apply/{jobId}/{jobseekerId}")
    public applicationdb apply(@PathVariable Integer jobId,
                               @PathVariable Integer jobseekerId,
                               @RequestBody applicationdb db) {
        return appser.apply(jobId, jobseekerId, db);
    }

    @GetMapping("/get")
    public List<applicationdb> getAll() {
        return appser.getAll();
    }

    @GetMapping("/get/{id}")
    public applicationdb getById(@PathVariable Integer id) {
        return appser.getById(id);
    }

    @PutMapping("/update/{id}")
    public applicationdb update(@PathVariable Integer id,
                                @RequestBody applicationdb db) {
        return appser.update(id, db);
    }

    @PatchMapping("/update/status/{id}")
    public applicationdb updateStatus(@PathVariable Integer id,
                                      @RequestBody applicationdb db) {
        return appser.updateStatus(id, db);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return appser.delete(id);
    }

    @GetMapping("/get/job/{jobId}")
    public List<applicationdb> getByJob(@PathVariable Integer jobId) {
        return appser.getByJob(jobId);
    }

    @GetMapping("/count/job/{jobId}")
    public long countByJob(@PathVariable Integer jobId) {
        return appser.countByJob(jobId);
    }

    @GetMapping("/get/jobseeker/{jobseekerId}")
    public List<applicationdb> getByJobSeeker(@PathVariable Integer jobseekerId) {
        return appser.getByJobSeeker(jobseekerId);
    }

    @GetMapping("/get/status/{status}")
    public List<applicationdb> getByStatus(@PathVariable String status) {
        return appser.getByStatus(status);
    }
}

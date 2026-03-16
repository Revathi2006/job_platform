package com.example.job.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.job.models.jobdb;

import com.example.job.services.jobSer;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/job")
@RequiredArgsConstructor
public class jobCon {

    private final jobSer jobser;

    // CREATE with employerId
    @PostMapping("/post/{employerId}")
    public jobdb insert(@RequestBody jobdb db, @PathVariable Integer employerId) {
        return jobser.insert(db, employerId);
    }

    // READ ALL
    @GetMapping("/get")
    public List<jobdb> getAll() {
        return jobser.getAll();
    }

    // READ BY ID
    @GetMapping("/get/{id}")
    public jobdb getById(@PathVariable Integer id) {
        return jobser.getById(id);
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public jobdb update(@PathVariable Integer id, @RequestBody jobdb db) {
        return jobser.update(id, db);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return jobser.delete(id);
    }

    // SEARCH
    @GetMapping("/get/location/{location}")
    public List<jobdb> getByLocation(@PathVariable String location) {
        return jobser.getByLocation(location);
    }

    @GetMapping("/get/title/{title}")
    public List<jobdb> getByTitle(@PathVariable String title) {
        return jobser.getByTitle(title);
    }

    // Jobs by Employer
    @GetMapping("/get/employer/{id}")
    public List<jobdb> getJobsByEmployer(@PathVariable Integer id) {
        return jobser.getJobsByEmployerId(id);
    }
}

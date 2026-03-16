package com.example.job.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.job.models.jobseekerdb;
import com.example.job.services.jobseekerSer;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/jobseeker")
@RequiredArgsConstructor
public class jobseekerCon {

    private final jobseekerSer jobseekerser;

    @PostMapping("/post")
    public jobseekerdb insert(@RequestBody jobseekerdb db) {
        return jobseekerser.insert(db);
    }

    @GetMapping("/get")
    public List<jobseekerdb> getAll() {
        return jobseekerser.getAll();
    }

    @GetMapping("/get/{id}")
    public jobseekerdb getById(@PathVariable Integer id) {
        return jobseekerser.getById(id);
    }

    @PutMapping("/update/{id}")
    public jobseekerdb update(@PathVariable Integer id, @RequestBody jobseekerdb db) {
        return jobseekerser.update(id, db);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return jobseekerser.delete(id);
    }

    // SEARCH
    @GetMapping("/get/name/{name}")
    public List<jobseekerdb> getByName(@PathVariable String name) {
        return jobseekerser.getByName(name);
    }

    @GetMapping("/get/email/{email}")
    public List<jobseekerdb> getByEmail(@PathVariable String email) {
        return jobseekerser.getByEmail(email);
    }

    @PostMapping(value = "/resume/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public jobseekerdb uploadResume(@PathVariable Integer id, @RequestPart("file") MultipartFile file) {
        return jobseekerser.saveResume(id, file);
    }

    @GetMapping("/resume/{id}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Integer id) {
        return jobseekerser.downloadResume(id);
    }
}

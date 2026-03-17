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

import com.example.job.models.employerdb;

import com.example.job.services.employerSer;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employer")
@RequiredArgsConstructor
public class employerCon {

    private final employerSer empser;

    // CREATE
    @PostMapping("/post")
    public employerdb insert(@RequestBody employerdb db) {
        return empser.insert(db);
    }

    // READ ALL
    @GetMapping("/get")
    public List<employerdb> getAll() {
        return empser.getAll();
    }

    // READ BY ID
    @GetMapping("/get/{id}")
    public employerdb getById(@PathVariable Integer id) {
        return empser.getById(id);
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public employerdb update(@PathVariable Integer id, @RequestBody employerdb db) {
        return empser.update(id, db);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return empser.delete(id);
    }

    // SEARCH APIs like your screenshot
    @GetMapping("/get/location/{location}")
    public List<employerdb> getByLocation(@PathVariable String location) {
        return empser.getByLocation(location);
    }

    @GetMapping("/get/email/{email}")
    public List<employerdb> getByEmail(@PathVariable String email) {
        return empser.getByEmail(email);
    }

    @GetMapping("/get/company/{companyname}")
    public List<employerdb> getByCompany(@PathVariable String companyname) {
        return empser.getByCompany(companyname);
    }

    @GetMapping("/get/search/{company}/{location}")
    public List<employerdb> getByCompanyAndLocation(@PathVariable String company,
                                                    @PathVariable String location) {
        return empser.getByCompanyAndLocation(company, location);
    }
}

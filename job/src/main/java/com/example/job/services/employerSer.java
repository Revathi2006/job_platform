package com.example.job.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.job.models.employerdb;
import com.example.job.repository.employerRepo;

@Service
public class employerSer {
    @Autowired
    private employerRepo emprepo;

    public employerdb insert(employerdb db) {
        return emprepo.save(db);
    }

    public List<employerdb> getAll() {
        return emprepo.findAll();
    }

    public employerdb getById(Integer id) {
        return emprepo.findById(id).orElse(null);
    }

    public employerdb update(Integer id, employerdb newData) {
        employerdb old = emprepo.findById(id).orElse(null);
        if (old == null) return null;

        old.setEmpLoc(newData.getEmpLoc());
        old.setEmpcomname(newData.getEmpcomname());
        old.setEmail(newData.getEmail());

        return emprepo.save(old);
    }

    public String delete(Integer id) {
        if (!emprepo.existsById(id)) return "Employer not found";
        emprepo.deleteById(id);
        return "Employer deleted successfully";
    }

    // Search methods
    public List<employerdb> getByLocation(String loc) {
        return emprepo.findByEmpLoc(loc);
    }

    public List<employerdb> getByEmail(String email) {
        return emprepo.findByEmail(email);
    }

    public List<employerdb> getByCompany(String company) {
        return emprepo.findByEmpcomname(company);
    }

    public List<employerdb> getByCompanyAndLocation(String company, String loc) {
        return emprepo.findByEmpcomnameAndEmpLoc(company, loc);
    }
}

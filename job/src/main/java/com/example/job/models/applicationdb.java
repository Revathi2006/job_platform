package com.example.job.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class applicationdb {
    @Id
    @GeneratedValue
    Integer appid;
    String status;

    String applicantName;
    String applicantEmail;
    String applicantPhone;
    String applicantSkills;
    String note;
    
    String appliedAt;

    @ManyToOne
    @JoinColumn(name="jobid")
    private jobdb job;

    @ManyToOne
    @JoinColumn(name="Jobseekerid")
    @JsonIgnoreProperties({"app"})
    private jobseekerdb jobseeker;

    
}

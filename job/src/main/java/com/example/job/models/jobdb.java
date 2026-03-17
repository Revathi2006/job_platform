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
public class jobdb {
    @Id
    @GeneratedValue
    Integer jobid;
    
    String jobtittle;
    String jobdes;
    String jobskills;
    String jobloc;
    String jobtype;
    String salary;
    String createdAt;
    String applyDeadline;

    @ManyToOne
    @JoinColumn(name="employerid")
    @JsonIgnoreProperties({"jobs"})
    private employerdb employer;

}

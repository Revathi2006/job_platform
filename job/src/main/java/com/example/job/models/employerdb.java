package com.example.job.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class employerdb {

    @Id
    @GeneratedValue
    Integer emid;

    String empLoc;

    String empcomname;

    String email;

    @OneToMany(mappedBy="employer")
    @JsonIgnoreProperties({"employer"})
    private List<jobdb> jobs;






    
}

package com.example.job.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import lombok.Data;
import java.util.*;

@Data
@Entity
public class jobseekerdb {
    @Id
    @GeneratedValue
    Integer jobseekerid;

    String jobseekername;
    String jobseekeremail;
    String jobexper;

    String jobskills;

    String resumeName;
    String resumeType;
    Long resumeSize;
    String resumeUpdatedAt;

    @Lob
    @JsonIgnore
    byte[] resumeData;

    @OneToMany(mappedBy="jobseeker")
    @JsonIgnoreProperties({"jobseeker"})
    private List<applicationdb> app;

}

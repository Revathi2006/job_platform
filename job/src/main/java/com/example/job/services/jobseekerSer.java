package com.example.job.services;

import java.time.Instant;
import java.util.List;


import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.job.models.jobseekerdb;
import com.example.job.repository.jobseekerRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class jobseekerSer {

    private final jobseekerRepo jobseekerrepo;

    public jobseekerdb insert(jobseekerdb db) {
        return jobseekerrepo.save(db);
    }

    public List<jobseekerdb> getAll() {
        return jobseekerrepo.findAll();
    }

    public jobseekerdb getById(Integer id) {
        return jobseekerrepo.findById(id).orElse(null);
    }

    public jobseekerdb update(Integer id, jobseekerdb newData) {
        jobseekerdb old = jobseekerrepo.findById(id).orElse(null);
        if (old == null) return null;

        old.setJobseekername(newData.getJobseekername());
        old.setJobseekeremail(newData.getJobseekeremail());
        old.setJobexper(newData.getJobexper());
        old.setJobskills(newData.getJobskills());

        return jobseekerrepo.save(old);
    }

    public jobseekerdb saveResume(Integer id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No resume uploaded");
        }

        jobseekerdb seeker = jobseekerrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jobseeker not found"));

        try {
            seeker.setResumeName(file.getOriginalFilename());
            seeker.setResumeType(file.getContentType());
            seeker.setResumeSize(file.getSize());
            seeker.setResumeUpdatedAt(Instant.now().toString());
            seeker.setResumeData(file.getBytes());
            return jobseekerrepo.save(seeker);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save resume");
        }
    }

    public ResponseEntity<byte[]> downloadResume(Integer id) {
        jobseekerdb seeker = jobseekerrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jobseeker not found"));

        byte[] data = seeker.getResumeData();
        if (data == null || data.length == 0) {
            throw new RuntimeException("Resume not uploaded");
        }

        String name = seeker.getResumeName();
        String safeName = (name == null || name.isBlank()) ? "resume" : name.replaceAll("[\\r\\n\\\\\"]+", "_");
        String type = seeker.getResumeType();
        MediaType mediaType;
        try {
            mediaType = (type == null || type.isBlank()) ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(type);
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeName + "\"")
                .body(data);
    }

    public String delete(Integer id) {
        if (!jobseekerrepo.existsById(id)) return "JobSeeker not found";
        jobseekerrepo.deleteById(id);
        return "JobSeeker deleted successfully";
    }

    public List<jobseekerdb> getByName(String name) {
        return jobseekerrepo.findByJobseekername(name);
    }

    public List<jobseekerdb> getByEmail(String email) {
        return jobseekerrepo.findByJobseekeremail(email);
    }
}

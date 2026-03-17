
package com.example.job.services;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.job.models.applicationdb;
import com.example.job.models.jobdb;
import com.example.job.models.jobseekerdb;
import com.example.job.repository.applicationRepo;
import com.example.job.repository.jobRepo;
import com.example.job.repository.jobseekerRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class applicationSer {

    private final applicationRepo apprepo;
    private final jobRepo jobrepo;
    private final jobseekerRepo jobseekerrepo;

    private static final List<String> ALLOWED_STATUSES = List.of(
            "APPLIED",
            "UNDER_REVIEW",
            "SHORTLISTED",
            "INTERVIEW",
            "SELECTED",
            "REJECTED"
    );

    public applicationdb apply(Integer jobId, Integer jobseekerId, applicationdb db) {

        jobdb job = jobrepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        jobseekerdb seeker = jobseekerrepo.findById(jobseekerId)
                .orElseThrow(() -> new RuntimeException("Jobseeker not found"));

        String deadline = job.getApplyDeadline();
        if (deadline != null && !deadline.isBlank()) {
            try {
                LocalDate d = LocalDate.parse(deadline.trim());
                Instant end = d.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusSeconds(1);
                if (Instant.now().isAfter(end)) {
                    throw new RuntimeException("Applications closed");
                }
            } catch (RuntimeException re) {
                throw re;
            } catch (Exception e) {
                // ignore invalid deadline format
            }
        }

        if (apprepo.existsByJob_JobidAndJobseeker_Jobseekerid(jobId, jobseekerId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        db.setJob(job);
        db.setJobseeker(seeker);

        db.setApplicantName(seeker.getJobseekername());
        db.setApplicantEmail(seeker.getJobseekeremail());
        if (db.getApplicantSkills() == null || db.getApplicantSkills().isBlank()) {
            db.setApplicantSkills(seeker.getJobskills());
        }
        db.setAppliedAt(Instant.now().toString());

        db.setStatus("APPLIED");

        return apprepo.save(db);
    }

    public List<applicationdb> getAll() {
        return apprepo.findAll();
    }

    public applicationdb getById(Integer id) {
        return apprepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public applicationdb update(Integer id, applicationdb newData) {
        applicationdb old = apprepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        old.setStatus(newData.getStatus());
        return apprepo.save(old);
    }

    public applicationdb updateStatus(Integer id, applicationdb newData) {
        applicationdb old = apprepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String next = (newData.getStatus() == null ? "" : newData.getStatus().toString()).trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(next)) {
            throw new RuntimeException("Invalid status");
        }

        old.setStatus(next);
        return apprepo.save(old);
    }

    public String delete(Integer id) {
        if (!apprepo.existsById(id)) {
            throw new RuntimeException("Application not found");
        }

        apprepo.deleteById(id);
        return "Application deleted successfully";
    }

    public List<applicationdb> getByJob(Integer jobId) {
        return apprepo.findByJob_Jobid(jobId);
    }

    public List<applicationdb> getByJobSeeker(Integer jobseekerId) {
        return apprepo.findByJobseeker_Jobseekerid(jobseekerId);
    }

    public List<applicationdb> getByStatus(String status) {
        return apprepo.findByStatus(status);
    }

    public long countByJob(Integer jobId) {
        return apprepo.countByJob_Jobid(jobId);
    }
}


package com.example.job.services;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.job.models.employerdb;
import com.example.job.models.jobdb;
import com.example.job.repository.employerRepo;
import com.example.job.repository.jobRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class jobSer {

    private final jobRepo jobrepo;
    private final employerRepo emprepo;

    public jobdb insert(jobdb db, Integer employerId) {
        employerdb emp = emprepo.findById(employerId).orElse(null);
        if (emp == null) return null;

        db.setEmployer(emp);
        if (db.getCreatedAt() == null || db.getCreatedAt().isBlank()) {
            db.setCreatedAt(Instant.now().toString());
        }
        return jobrepo.save(db);
    }

    public List<jobdb> getAll() {
        return jobrepo.findAll();
    }

    public jobdb getById(Integer id) {
        return jobrepo.findById(id).orElse(null);
    }

    public jobdb update(Integer id, jobdb newData) {
        jobdb old = jobrepo.findById(id).orElse(null);
        if (old == null) return null;

        old.setJobtittle(newData.getJobtittle());
        old.setJobdes(newData.getJobdes());
        old.setJobskills(newData.getJobskills());
        old.setJobloc(newData.getJobloc());
        old.setJobtype(newData.getJobtype());
       
        old.setApplyDeadline(newData.getApplyDeadline());

        return jobrepo.save(old);
    }

    public String delete(Integer id) {
        if (!jobrepo.existsById(id)) return "Job not found";
        jobrepo.deleteById(id);
        return "Job deleted successfully";
    }

    public List<jobdb> getByLocation(String loc) {
        return jobrepo.findByJobloc(loc);
    }

    public List<jobdb> getByTitle(String title) {
        return jobrepo.findByJobtittle(title);
    }

    public List<jobdb> getJobsByEmployerId(Integer id) {
        return jobrepo.findByEmployer_Emid(id);
    }
}

package com.interview.tracker.interviewtracker.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.interview.tracker.interviewtracker.model.JobApplication;
import com.interview.tracker.interviewtracker.repository.JobApplicationRepository;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository repo;

    public List<JobApplication> getAllJobs() {
        return repo.findAll();
    }

    public JobApplication save(JobApplication job) {
        return repo.save(job);
    }

    public JobApplication getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}

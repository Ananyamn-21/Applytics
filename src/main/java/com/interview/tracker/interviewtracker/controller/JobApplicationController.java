package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.JobApplication;
import com.interview.tracker.interviewtracker.services.JDParserService;
import com.interview.tracker.interviewtracker.services.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/jobs")

public class JobApplicationController {

    @Autowired
    private JobApplicationService jobService;

    @Autowired
    private JDParserService jdParser;

    @GetMapping
    public List<JobApplication> getAll() {
        return jobService.getAllJobs();
    }

    @PostMapping
    public ResponseEntity<JobApplication> addJob(@RequestBody JobApplication job) {
        if (job.getJdUrl() != null && !job.getJdUrl().isEmpty()) {
            List<String> skills = jdParser.extractSkillsFromJD(job.getJdUrl());
            job.setExtractedSkills(skills);
        }
        return ResponseEntity.ok(jobService.save(job));
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.delete(id);
    }
}


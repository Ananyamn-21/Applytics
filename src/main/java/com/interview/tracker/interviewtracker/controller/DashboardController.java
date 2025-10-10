package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.repository.JobApplicationRepository;
import com.interview.tracker.interviewtracker.repository.SkillPreparationRepository;
import com.interview.tracker.interviewtracker.security.JwtUtil;
import com.interview.tracker.interviewtracker.model.JobApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JobApplicationRepository jobRepo;

    @Autowired
    private SkillPreparationRepository skillRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @RequestHeader("Authorization") String authHeader) {

        // 1️⃣ Extract JWT token
        String token = authHeader.substring(7);

        // 2️⃣ Extract userId from token
        Long userId = jwtUtil.extractUserId(token);

        // 3️⃣ Fetch jobs for current user
        List<JobApplication> userJobs = jobRepo.findByUserId(userId);

        long totalJobs = userJobs.size();
        long interviewing = userJobs.stream().filter(j -> "interview".equalsIgnoreCase(j.getStatus())).count();
        long applied = userJobs.stream().filter(j -> "applied".equalsIgnoreCase(j.getStatus())).count();

        // 4️⃣ Aggregate skills based on jobApplicationId
        long skillsCompleted = 0;
        long skillsInProgress = 0;

        for (JobApplication job : userJobs) {
            skillsCompleted += skillRepo.countByJobApplicationIdAndStatus(job.getId(), "completed");
            skillsInProgress += skillRepo.countByJobApplicationIdAndStatus(job.getId(), "in_progress");
        }

        // 5️⃣ Build summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalJobs", totalJobs);
        summary.put("interviewing", interviewing);
        summary.put("applied", applied);
        summary.put("skillsCompleted", skillsCompleted);
        summary.put("skillsInProgress", skillsInProgress);

        return ResponseEntity.ok(summary);
    }
}

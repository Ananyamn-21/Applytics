package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.InterviewEvaluation;
import com.interview.tracker.interviewtracker.repository.InterviewEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/evaluations")
public class EvaluationController {
    @Autowired
    private InterviewEvaluationRepository repo;

    @PostMapping
    public InterviewEvaluation addEvaluation(@RequestBody InterviewEvaluation eval) {
        return repo.save(eval);
    }

    @GetMapping("/job/{jobId}")
    public List<InterviewEvaluation> getByJob(@PathVariable Long jobId) {
        return repo.findByJobId(jobId);
    }
}

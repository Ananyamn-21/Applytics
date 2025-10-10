package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.Flashcard;
import com.interview.tracker.interviewtracker.model.InterviewEvaluation;
import com.interview.tracker.interviewtracker.repository.FlashcardRepository;
import com.interview.tracker.interviewtracker.repository.InterviewEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private InterviewEvaluationRepository evalRepo;

    @Autowired
    private FlashcardRepository flashRepo;

    @PostMapping
    public InterviewEvaluation addEvaluation(@RequestBody InterviewEvaluation eval) {
        InterviewEvaluation savedEval = evalRepo.save(eval);

        // Create flashcards for missed concepts
        if (savedEval.getConceptsMissed() != null && !savedEval.getConceptsMissed().isBlank()) {
            Arrays.stream(savedEval.getConceptsMissed().split(","))
                    .map(String::trim)
                    .filter(concept -> !concept.isEmpty())
                    .forEach(concept -> {
                        Flashcard flash = new Flashcard();
                        flash.setJobId(savedEval.getJobId());
                        flash.setEvaluationId(savedEval.getId());
                        flash.setConceptName(concept);
                        flash.setQuestion("Explain: " + concept);
                        flash.setAnswer("You missed this concept in interview — revise from reliable resources.");
                        flash.setStatus("missed");
                        flashRepo.save(flash);
                    });
        }

        return savedEval;
    }

    @GetMapping("/all")
    public List<InterviewEvaluation> getAllEvaluations() {
        return evalRepo.findAll();
    }
    
    @GetMapping("/job/{jobId}")
    public List<InterviewEvaluation> getByJob(@PathVariable Long jobId) {
        return evalRepo.findByJobId(jobId);
    }
}

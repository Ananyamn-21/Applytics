package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.Flashcard;
import com.interview.tracker.interviewtracker.repository.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/flashcards")
public class FlashcardController {
    @Autowired
    private FlashcardRepository repo;

    @PostMapping
    public Flashcard create(@RequestBody Flashcard card) {
        return repo.save(card);
    }

    @GetMapping("/job/{jobId}")
    public List<Flashcard> getByJob(@PathVariable Long jobId) {
        return repo.findByJobId(jobId);
    }
}

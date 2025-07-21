package com.interview.tracker.interviewtracker.repository;

import com.interview.tracker.interviewtracker.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByJobId(Long jobId);
}


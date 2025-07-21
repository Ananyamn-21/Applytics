package com.interview.tracker.interviewtracker.repository;

import com.interview.tracker.interviewtracker.model.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    List<InterviewEvaluation> findByJobId(Long jobId);
}

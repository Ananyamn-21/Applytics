package com.interview.tracker.interviewtracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobId;          // Link to Job
    private Long evaluationId;  
    private String conceptName;  // For missed concept
    private String question;
    private String answer;
    private String status;       // missed, review, mastered

    @ElementCollection
    private List<String> tags;
}

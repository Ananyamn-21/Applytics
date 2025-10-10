

package com.interview.tracker.interviewtracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillPreparation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobApplicationId;
    private String skillName;
    private String resourceUrl; 
    private String status; 
    private int progress;
//    private Long userId;

}

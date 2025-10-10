package com.interview.tracker.interviewtracker.repository;

import com.interview.tracker.interviewtracker.model.SkillPreparation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillPreparationRepository extends JpaRepository<SkillPreparation, Long> {
    List<SkillPreparation> findByJobApplicationId(Long jobApplicationId);
    List<SkillPreparation> findBySkillName(String skillName);
    List<SkillPreparation> findByStatus(String status);
   
     
      long countByJobApplicationIdAndStatus(Long jobApplicationId, String status);



}

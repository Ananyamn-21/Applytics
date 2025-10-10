package com.interview.tracker.interviewtracker.repository;

import com.interview.tracker.interviewtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; 
import java.util.Optional;


@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCompanyName(String companyName);
    List<JobApplication> findByStatus(String status);
    List<JobApplication> findByUserId(Long userId);
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
    long countByStatus(String status);
     
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
}

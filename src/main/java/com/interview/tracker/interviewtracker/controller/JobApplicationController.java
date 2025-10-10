//package com.interview.tracker.interviewtracker.controller;
//
//import com.interview.tracker.interviewtracker.model.JobApplication;
//import com.interview.tracker.interviewtracker.model.SkillPreparation;
//import com.interview.tracker.interviewtracker.model.Flashcard;
//import com.interview.tracker.interviewtracker.repository.SkillPreparationRepository;
//import com.interview.tracker.interviewtracker.repository.FlashcardRepository;
//import com.interview.tracker.interviewtracker.services.JobApplicationService;
//import com.interview.tracker.interviewtracker.services.SkillExtractorService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@CrossOrigin(origins = "http://localhost:4200")
//@RequestMapping("/api/jobs")
//public class JobApplicationController {
//
//    @Autowired
//    private JobApplicationService jobService;
//
//    @Autowired
//    private SkillExtractorService skillExtractorService;
//
//    @Autowired
//    private SkillPreparationRepository skillPreparationRepository;
//
//    @Autowired
//    private FlashcardRepository flashCardRepository;
//
//    @GetMapping
//    public List<JobApplication> getAll() {
//        return jobService.getAllJobs();
//    }
//
//    @PostMapping
//    public ResponseEntity<JobApplication> addJobApplication(
//            @RequestBody JobApplication jobApplication,
//            @RequestHeader("Authorization") String authHeader) {
//        
//         String token = authHeader.substring(7);
//
//    // Extract userId from JWT
//            Long userId = jwtUtil.extractUserId(token);
//            jobApplication.setUserId(userId); 
//
//        // 1. Extract Skills
//        if (jobApplication.getJdText() != null && !jobApplication.getJdText().isBlank()) {
//            List<String> extracted = skillExtractorService.extract(jobApplication.getJdText());
//            jobApplication.setExtractedSkills(extracted);
//        }
//
//        // 2. Save Job Application
//        JobApplication savedJob = jobService.save(jobApplication);
//
//        // 3. Create Skill Preparation & Flashcards
//        if (savedJob.getExtractedSkills() != null) {
//            savedJob.getExtractedSkills().forEach(skill -> {
//                // Skill Preparation
//                SkillPreparation sp = new SkillPreparation();
//                sp.setJobApplicationId(savedJob.getId());
//                sp.setSkillName(skill);
//                sp.setResourceUrl("https://www.google.com/search?q=" + skill + "+resources");
//                sp.setStatus("not_started");
//                sp.setProgress(0);
//                skillPreparationRepository.save(sp);
//
//                // Flashcard
//                Flashcard flash = new Flashcard();
//                flash.setJobId(savedJob.getId());
//                flash.setConceptName(skill);
//                flash.setQuestion("Explain the basics of " + skill);
//                flash.setAnswer("Answer about " + skill);
//                flash.setStatus("review");
//                flashCardRepository.save(flash);
//            });
//        }
//
//        return ResponseEntity.ok(savedJob);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteJob(@PathVariable Long id) {
//        jobService.delete(id);
//    }
//}
package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.JobApplication;
import com.interview.tracker.interviewtracker.model.SkillPreparation;
import com.interview.tracker.interviewtracker.model.Flashcard;
import com.interview.tracker.interviewtracker.repository.SkillPreparationRepository;
import com.interview.tracker.interviewtracker.repository.FlashcardRepository;
import com.interview.tracker.interviewtracker.services.JobApplicationService;
import com.interview.tracker.interviewtracker.services.SkillExtractorService;
import com.interview.tracker.interviewtracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/jobs")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobService;

    @Autowired
    private SkillExtractorService skillExtractorService;

    @Autowired
    private SkillPreparationRepository skillPreparationRepository;

    @Autowired
    private FlashcardRepository flashCardRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Fetch jobs for the logged-in user
    @GetMapping
    public List<JobApplication> getAll(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return jobService.getJobsByUser(userId);
    }

    // Add job application with userId from token
    @PostMapping
    public ResponseEntity<JobApplication> addJobApplication(
            @RequestBody JobApplication jobApplication,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        jobApplication.setUserId(userId);

        // 1. Extract Skills
        if (jobApplication.getJdText() != null && !jobApplication.getJdText().isBlank()) {
            List<String> extracted = skillExtractorService.extract(jobApplication.getJdText());
            jobApplication.setExtractedSkills(extracted);
        }

        // 2. Save Job Application
        JobApplication savedJob = jobService.save(jobApplication);

        // 3. Create Skill Preparation & Flashcards
        if (savedJob.getExtractedSkills() != null) {
            savedJob.getExtractedSkills().forEach(skill -> {
                SkillPreparation sp = new SkillPreparation();
                sp.setJobApplicationId(savedJob.getId());
                sp.setSkillName(skill);
                sp.setResourceUrl("https://www.google.com/search?q=" + skill + "+resources");
                sp.setStatus("not_started");
                sp.setProgress(0);
                skillPreparationRepository.save(sp);

                Flashcard flash = new Flashcard();
                flash.setJobId(savedJob.getId());
                flash.setConceptName(skill);
                flash.setQuestion("Explain the basics of " + skill);
                flash.setAnswer("Answer about " + skill);
                flash.setStatus("review");
                flashCardRepository.save(flash);
            });
        }

        return ResponseEntity.ok(savedJob);
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.delete(id);
    }
    
   // Update job application status
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateJobStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        // Fetch the job application for the user
        JobApplication job = jobService.getJobByIdAndUser(id, userId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        job.setStatus(status);
        JobApplication updatedJob = jobService.save(job);

        return ResponseEntity.ok(updatedJob);
    }

}

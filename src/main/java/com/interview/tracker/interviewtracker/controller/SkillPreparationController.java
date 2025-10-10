package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.model.SkillPreparation;
import com.interview.tracker.interviewtracker.repository.SkillPreparationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/skills")
public class SkillPreparationController {

    @Autowired
    private SkillPreparationRepository skillRepo;


    @GetMapping("/job/{jobId}")
    public List<SkillPreparation> getSkillsByJob(@PathVariable Long jobId) {
        return skillRepo.findByJobApplicationId(jobId);
    }


    @GetMapping
    public List<SkillPreparation> getAllSkills(@RequestParam(required = false) String status,
                                               @RequestParam(required = false) String skillName) {
        if (status != null) {
            return skillRepo.findByStatus(status); 
        } else if (skillName != null) {
            return skillRepo.findBySkillName(skillName);
        } else {
            return skillRepo.findAll();
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<SkillPreparation> updateSkill(@PathVariable Long id, @RequestBody SkillPreparation updatedSkill) {
        SkillPreparation skill = skillRepo.findById(id).orElse(null);
        if (skill == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedSkill.getStatus() != null) {
            skill.setStatus(updatedSkill.getStatus());
        }
        skill.setProgress(updatedSkill.getProgress());

        skillRepo.save(skill);
        return ResponseEntity.ok(skill);
    }


    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable Long id) {
        skillRepo.deleteById(id);
    }
}

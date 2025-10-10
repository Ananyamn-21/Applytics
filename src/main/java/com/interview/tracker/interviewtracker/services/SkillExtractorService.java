

package com.interview.tracker.interviewtracker.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;


@Service
public class SkillExtractorService {

    private static final List<String> SKILL_KEYWORDS = List.of(
           "Java", "Spring Boot", "Angular", "React", "MongoDB", "PostgreSQL", "Python", "Docker","Flask","Docker",
            "SQL","Nosql","JavaScript","Node.js","Express.js","AWS","Cloud","CI/CD","Kubernetes","Linux","Django"
    );

    public List<String> extract(String jdText) {
        return SKILL_KEYWORDS.stream()
                .filter(skill -> jdText.toLowerCase().contains(skill.toLowerCase()))
                .toList();
    }
}


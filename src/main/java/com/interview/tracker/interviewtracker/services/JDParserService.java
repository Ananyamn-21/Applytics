package com.interview.tracker.interviewtracker.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

@Service
public class JDParserService {

    private static final List<String> SKILLS = List.of(
            "Java", "Spring Boot", "Angular", "React", "MongoDB", "PostgreSQL", "Python", "Docker","Flask","Docker",
            "SQL","Nosql","JavaScript","Node.js","Express.js","AWS","Cloud","CI/CD","Kubernetes","Linux","Django"
    );

    public List<String> extractSkillsFromJD(String url) {
        List<String> foundSkills = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(url).get();
            String text = doc.text().toLowerCase();

            for (String skill : SKILLS) {
                if (text.contains(skill.toLowerCase())) {
                    foundSkills.add(skill);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return foundSkills;
    }
}



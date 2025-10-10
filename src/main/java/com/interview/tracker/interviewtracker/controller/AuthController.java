package com.interview.tracker.interviewtracker.controller;

import com.interview.tracker.interviewtracker.dto.AuthRequest;
import com.interview.tracker.interviewtracker.dto.AuthResponse;
import com.interview.tracker.interviewtracker.model.User;
import com.interview.tracker.interviewtracker.repository.UserRepository;
import com.interview.tracker.interviewtracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ---------------- Register ----------------
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody AuthRequest request) {
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", "error",
                            "message", "Username already taken"
                    ));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(encoder.encode(request.getPassword()));
        userRepo.save(user);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User registered successfully"
        ));
    }

    // ---------------- Login ----------------
//    @PostMapping("/login")
//    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
//        try {
//            authManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
//            );
//        } catch (Exception ex) {
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED)
//                    .body(Map.of(
//                            "status", "error",
//                            "message", "Invalid credentials"
//                    ));
//        }
//
//        String token = jwtUtil.generateToken(request.getUsername());
//
//        return ResponseEntity.ok(Map.of(
//                "status", "success",
//                "message", "Login successful",
//                "token", token
//        ));
//    }
    
    @PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
    try {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
    } catch (Exception ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "status", "error",
                        "message", "Invalid credentials"
                ));
    }

    // Fetch user from DB to get userId
    User user = userRepo.findByUsername(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found"));

    String token = jwtUtil.generateToken(user.getUsername(), user.getId());

    return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Login successful",
            "token", token,
            "userId", user.getId()
    ));
}

}

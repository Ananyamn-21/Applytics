# 🚀 Applytics Backend – Spring Boot API for Interview Prep Tracker

This is the **Spring Boot backend** for **Applytics** — a smart interview preparation and job application tracking platform.  
It exposes REST APIs to manage users, job applications, skill analysis from job descriptions, evaluations, and flashcards — all secured with **JWT-based authentication**.

---

## 📌 Key Features

- ✅ User registration and login with **JWT Auth**
- ✅ Add/update/delete job applications
- ✅ Analyze job descriptions via **JSoup** to extract relevant skills
- ✅ Manage skill preparation status with notes
- ✅ Log post-interview self-evaluations
- ✅ Create flashcards for missed questions
- ✅ REST APIs consumed by Angular frontend

---

## 🧰 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Spring Boot 3.5                     |
| Language    | Java 21                             |
| DB          | PostgreSQL 
| Auth        | Spring Security, JWT, BCrypt        |
| Parsing     | JSoup (for JD HTML parsing)         |
| Docs/Test   | Postman Collection included         |

---

## 📂 Folder Structure

/interviewtracker-backend
├── controller/
├── model/
├── repository/
├── service/
├── security/
│ ├── JwtUtil.java
│ ├── JwtFilter.java
│ └── SecurityConfig.java
├── dto/
├── config/
└── InterviewTrackerApplication.java


---

## 🔐 Authentication

- JWT-based login with `/api/auth/login`
- All protected routes require `Authorization: Bearer <token>`
- Passwords are encrypted with **BCrypt**

---

## 🧪 API Endpoints

| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | `/api/auth/register`    | Register a new user            |
| POST   | `/api/auth/login`       | Authenticate + get JWT token   |
| GET    | `/api/jobs`             | List all job applications      |
| POST   | `/api/jobs`             | Create new job entry           |
| POST   | `/api/jd/analyze`       | Analyze JD and extract skills  |
| POST   | `/api/skills/prepare`   | Mark skill as prepared         |
| POST   | `/api/evaluation`       | Log post-interview review      |
| GET    | `/api/flashcards`       | Get flashcards                 |
| POST   | `/api/flashcards`       | Create new flashcard           |

➡️ Full list included in [`Applytics.postman_collection.json`](./Applytics.postman_collection.json)

---

## 🔧 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3+
- PostgreSQL (or MongoDB)
- IntelliJ / VSCode

### Steps

```bash
# 1. Clone the repo
git clone git@github.com:paramesh244/Applytics.git

# 2. Navigate to backend folder
cd interviewtracker-backend

# 3. Configure application.properties
# Set DB config + JWT secret + port
nano src/main/resources/application.properties

# 4. Build and run
./mvnw spring-boot:run
🧠 Environment Configuration (application.properties)
# Server Port
server.port=8080

# PostgreSQL config
spring.datasource.url=jdbc:postgresql://localhost:5432/applytics_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# JWT Secret
jwt.secret=yourSuperSecretKey


# Early Edge - API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Public Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d"
}
```

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Protected Endpoints

All endpoints below require a valid JWT token in the Authorization header.

---

### User Profile

#### Get Profile

Retrieve the authenticated user's profile.

**Endpoint:** `GET /users/profile`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "id": "uuid",
    "resumeUrl": "/uploads/resumes/uuid.pdf",
    "resumeText": "John Doe\nSenior Software Engineer...",
    "experience": 5,
    "location": "San Francisco, CA",
    "phone": "+1234567890",
    "summary": "Experienced software engineer..."
  }
}
```

---

#### Update Profile

Update user profile information.

**Endpoint:** `PUT /users/profile`

**Request Body:**
```json
{
  "experience": 6,
  "location": "New York, NY",
  "phone": "+1987654321",
  "summary": "Passionate developer with 6 years experience..."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "id": "uuid",
    "experience": 6,
    "location": "New York, NY",
    "phone": "+1987654321",
    "summary": "Passionate developer with 6 years experience..."
  }
}
```

---

#### Upload Resume

Upload a resume (PDF or DOC/DOCX).

**Endpoint:** `POST /users/resume`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `resume`: File (max 5MB, types: pdf, doc, docx)

**Response (201):**
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "/uploads/resumes/uuid.pdf",
  "resumeText": "John Doe\nSenior Software Engineer..."
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "File too large. Max size is 5MB",
  "error": "Bad Request"
}
```

---

### Skills

#### Get All Skills

Retrieve all skills for the authenticated user.

**Endpoint:** `GET /skills`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "TypeScript",
    "proficiency": "expert",
    "userId": "uuid"
  },
  {
    "id": "uuid",
    "name": "React",
    "proficiency": "advanced",
    "userId": "uuid"
  }
]
```

---

#### Create Skill

Add a new skill.

**Endpoint:** `POST /skills`

**Request Body:**
```json
{
  "name": "Node.js",
  "proficiency": "advanced"
}
```

**Proficiency Options:** `beginner`, `intermediate`, `advanced`, `expert`

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Node.js",
  "proficiency": "advanced",
  "userId": "uuid"
}
```

---

#### Update Skill

Update an existing skill.

**Endpoint:** `PUT /skills/:id`

**Request Body:**
```json
{
  "name": "Node.js",
  "proficiency": "expert"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Node.js",
  "proficiency": "expert",
  "userId": "uuid"
}
```

---

#### Delete Skill

Remove a skill.

**Endpoint:** `DELETE /skills/:id`

**Response (200):**
```json
{
  "message": "Skill deleted successfully"
}
```

---

### Job Preferences

#### Get All Preferences

Retrieve all job preferences for the authenticated user.

**Endpoint:** `GET /job-preferences`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "role": "Senior Software Engineer",
    "keywords": ["React", "Node.js", "TypeScript"],
    "location": "San Francisco, CA",
    "remote": true,
    "minSalary": 150000,
    "maxSalary": 200000,
    "jobType": "full-time",
    "isActive": true,
    "userId": "uuid"
  }
]
```

---

#### Create Preference

Add a new job preference.

**Endpoint:** `POST /job-preferences`

**Request Body:**
```json
{
  "role": "Full Stack Developer",
  "keywords": ["React", "Python", "AWS"],
  "location": "Remote",
  "remote": true,
  "minSalary": 120000,
  "maxSalary": 180000,
  "jobType": "full-time"
}
```

**Job Type Options:** `full-time`, `part-time`, `contract`, `internship`

**Response (201):**
```json
{
  "id": "uuid",
  "role": "Full Stack Developer",
  "keywords": ["React", "Python", "AWS"],
  "location": "Remote",
  "remote": true,
  "minSalary": 120000,
  "maxSalary": 180000,
  "jobType": "full-time",
  "isActive": true,
  "userId": "uuid"
}
```

---

#### Update Preference

Update an existing job preference.

**Endpoint:** `PUT /job-preferences/:id`

**Request Body:**
```json
{
  "role": "Senior Full Stack Developer",
  "remote": false,
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "role": "Senior Full Stack Developer",
  "keywords": ["React", "Python", "AWS"],
  "location": "Remote",
  "remote": false,
  "minSalary": 120000,
  "maxSalary": 180000,
  "jobType": "full-time",
  "isActive": true,
  "userId": "uuid"
}
```

---

#### Delete Preference

Remove a job preference.

**Endpoint:** `DELETE /job-preferences/:id`

**Response (200):**
```json
{
  "message": "Job preference deleted successfully"
}
```

---

### Platform Accounts

#### Get All Accounts

Retrieve all linked platform accounts.

**Endpoint:** `GET /platform-accounts`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "platform": "linkedin",
    "email": "user@linkedin.com",
    "isConnected": true,
    "status": "active",
    "lastActiveAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid",
    "platform": "naukri",
    "email": "user@naukri.com",
    "isConnected": true,
    "status": "paused",
    "lastActiveAt": "2024-01-14T15:20:00Z"
  }
]
```

---

#### Link Account

Link a LinkedIn or Naukri account.

**Endpoint:** `POST /platform-accounts/link`

**Request Body:**
```json
{
  "platform": "linkedin",
  "email": "user@linkedin.com",
  "password": "linkedin-password"
}
```

**Platform Options:** `linkedin`, `naukri`

**Response (201):**
```json
{
  "id": "uuid",
  "platform": "linkedin",
  "email": "user@linkedin.com",
  "isConnected": true,
  "status": "active",
  "userId": "uuid"
}
```

---

#### Unlink Account

Remove a linked platform account.

**Endpoint:** `DELETE /platform-accounts/:id/unlink`

**Response (200):**
```json
{
  "message": "Account unlinked successfully"
}
```

---

#### Pause Account

Pause auto-apply for a specific account.

**Endpoint:** `PUT /platform-accounts/:id/pause`

**Response (200):**
```json
{
  "id": "uuid",
  "platform": "linkedin",
  "email": "user@linkedin.com",
  "status": "paused"
}
```

---

#### Resume Account

Resume auto-apply for a paused account.

**Endpoint:** `PUT /platform-accounts/:id/resume`

**Response (200):**
```json
{
  "id": "uuid",
  "platform": "linkedin",
  "email": "user@linkedin.com",
  "status": "active"
}
```

---

### Jobs

#### Get All Jobs

Retrieve all discovered jobs (paginated).

**Endpoint:** `GET /jobs`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "externalId": "123456789",
      "platform": "linkedin",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "description": "We are looking for...",
      "jobUrl": "https://linkedin.com/jobs/123456789",
      "postedAt": "2024-01-15T10:00:00Z",
      "applicantCount": 5,
      "salary": "$150k - $200k",
      "jobType": "full-time",
      "isRemote": true
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

#### Get Job by ID

Retrieve a specific job by ID.

**Endpoint:** `GET /jobs/:id`

**Response (200):**
```json
{
  "id": "uuid",
  "externalId": "123456789",
  "platform": "linkedin",
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "description": "We are looking for...",
  "jobUrl": "https://linkedin.com/jobs/123456789",
  "postedAt": "2024-01-15T10:00:00Z",
  "applicantCount": 5,
  "salary": "$150k - $200k",
  "jobType": "full-time",
  "isRemote": true
}
```

---

### Job Applications

#### Get All Applications

Retrieve all job applications for the authenticated user.

**Endpoint:** `GET /applications`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "platform": "linkedin"
      },
      "status": "applied",
      "tailoredResumeText": "John Doe\nSenior Software Engineer...",
      "appliedAt": "2024-01-15T10:30:00Z",
      "notes": "Match score: 85. Highlights: React, TypeScript"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

#### Get Application Stats

Get application statistics for the authenticated user.

**Endpoint:** `GET /applications/stats`

**Response (200):**
```json
{
  "total": 50,
  "today": 5,
  "thisWeek": 15,
  "thisMonth": 40,
  "byStatus": {
    "applied": 35,
    "viewed": 8,
    "shortlisted": 4,
    "rejected": 2,
    "interview": 1,
    "offered": 0
  }
}
```

---

#### Get Application by ID

Retrieve a specific application with full details.

**Endpoint:** `GET /applications/:id`

**Response (200):**
```json
{
  "id": "uuid",
  "job": {
    "id": "uuid",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "jobUrl": "https://linkedin.com/jobs/123456789",
    "platform": "linkedin",
    "postedAt": "2024-01-15T10:00:00Z",
    "applicantCount": 5
  },
  "status": "applied",
  "tailoredResumeText": "John Doe\nSenior Software Engineer\n\nSUMMARY\nExperienced software engineer with expertise in...",
  "tailoredResumeUrl": "/uploads/tailored/uuid.pdf",
  "appliedAt": "2024-01-15T10:30:00Z",
  "notes": "Match score: 85. Highlights: React, TypeScript, Node.js"
}
```

---

### Dashboard

#### Get Dashboard

Retrieve the user's dashboard with aggregated statistics.

**Endpoint:** `GET /dashboard`

**Response (200):**
```json
{
  "stats": {
    "totalApplications": 50,
    "todayApplications": 5,
    "weekApplications": 15,
    "monthApplications": 40,
    "byStatus": {
      "applied": 35,
      "viewed": 8,
      "shortlisted": 4,
      "rejected": 2,
      "interview": 1,
      "offered": 0
    }
  },
  "platformAccounts": [
    {
      "id": "uuid",
      "platform": "linkedin",
      "status": "active",
      "lastActiveAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "platform": "naukri",
      "status": "paused",
      "lastActiveAt": "2024-01-14T15:20:00Z"
    }
  ],
  "recentApplications": [
    {
      "id": "uuid",
      "job": {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "platform": "linkedin"
      },
      "status": "applied",
      "appliedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "profile": {
    "hasResume": true,
    "skillsCount": 10,
    "preferencesCount": 2,
    "connectedAccounts": 2
  }
}
```

---

## Response Enums

### Application Status
| Status | Description |
|--------|-------------|
| `applied` | Application submitted |
| `viewed` | Recruiter viewed the application |
| `shortlisted` | Added to shortlist |
| `rejected` | Application rejected |
| `interview` | Interview scheduled |
| `offered` | Job offer received |

### Platform
| Value | Description |
|-------|-------------|
| `linkedin` | LinkedIn platform |
| `naukri` | Naukri platform |

### Account Status
| Value | Description |
|-------|-------------|
| `active` | Account active for auto-apply |
| `paused` | Temporarily paused by user |
| `suspended` | Suspected by platform (manual review) |
| `error` | Error occurred, needs attention |

### Job Type
| Value | Description |
|-------|-------------|
| `full-time` | Full-time position |
| `part-time` | Part-time position |
| `contract` | Contract role |
| `internship` | Internship |

### Proficiency
| Value | Description |
|-------|-------------|
| `beginner` | Beginner level |
| `intermediate` | Intermediate level |
| `advanced` | Advanced level |
| `expert` | Expert level |

---

## Error Responses

All endpoints may return standard error responses:

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 - Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Forbidden"
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 - Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limits

The API implements the following rate limits per user:

| Endpoint | Limit |
|----------|-------|
| Auto-apply | 15 applications/hour, 50/day |
| General API | 100 requests/minute |

---

## Webhooks (Future)

Future endpoints for receiving application status updates:

```
POST /webhooks/application-status
```

Request body will include:
```json
{
  "applicationId": "uuid",
  "status": "viewed",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {}
}
```

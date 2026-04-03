# Early Edge - Architecture Documentation

## Overview

Early Edge is an automated job application platform that helps users auto-apply for jobs on LinkedIn and Naukri based on their skills, resume, and preferences. The system uses AI to match jobs and tailor resumes without adding fake information.

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with Passport
- **AI**: OpenAI GPT-4 for resume tailoring and job matching
- **Queue**: Bull with Redis
- **Scheduling**: @nestjs/schedule (cron jobs)
- **File Storage**: Local filesystem with multer

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Frontend)                        │
│   • Dashboard (applied jobs, stats, resume viewer)             │
│   • Profile management (resume upload, skills, preferences)    │
│   • Platform account linking (LinkedIn, Naukri)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NestJS Application                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Auth Module                           │  │
│  │  • JWT Register/Login                                     │  │
│  │  • Password hashing (bcrypt)                             │  │
│  │  • Passport JWT Strategy                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Core Business Modules                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │   Users     │ │   Skills    │ │  Job Preferences    │ │  │
│  │  │ • Profile   │ │ • CRUD      │ │  • Role, keywords   │ │  │
│  │  │ • Resume    │ │ • Profi-    │ │  • Location, salary │ │  │
│  │  │   upload    │ │   ciency    │ │  • Job type         │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  │  ┌─────────────────────┐ ┌─────────────────────────────┐  │  │
│  │  │  Platform Accounts  │ │     Dashboard               │  │  │
│  │  │  • Link LinkedIn    │ │  • Stats aggregation        │  │  │
│  │  │  • Link Naukri      │ │  • Recent applications      │  │  │
│  │  │  • AES-256 encrypt  │ │  • Platform status          │  │  │
│  │  │  • Pause/Resume     │ │                             │  │  │
│  │  └─────────────────────┘ └─────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Auto-Apply Engine                       │  │
│  │  • Cron job (every 5 minutes, 24/7)                      │  │
│  │  • Rate limiting (15/hour, 50/day per user)              │  │
│  │  • Job search → Match score → Apply                      │  │
│  │  • Safety detection (auto-pause on issues)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      AI Service                           │  │
│  │  • Resume tailoring (GPT-4, no fake info)                │  │
│  │  • Job match scoring (0-100)                              │  │
│  │  • Highlights key experiences for each job               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Scrapers Module                       │  │
│  │  ┌─────────────────────┐ ┌─────────────────────────────┐  │  │
│  │  │   LinkedIn Scraper  │ │     Naukri Scraper          │  │  │
│  │  │   • Stealth browser │ │  • Stealth browser          │  │  │
│  │  │   • Session persist │ │  • Session persist          │  │  │
│  │  │   • Anti-ban delays │ │  • Anti-ban delays          │  │  │
│  │  └─────────────────────┘ └─────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│   users, user_profiles, skills, job_preferences,               │
│   platform_accounts, jobs, job_applications                    │
└─────────────────────────────────────────────────────────────────┘
```

## Database Models

### User
```typescript
{
  id: UUID (PK)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  isActive: boolean
}
```

### UserProfile
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  resumeUrl: string (file path)
  resumeText: string (parsed PDF content)
  experience: number (years)
  location: string
  phone: string
  summary: string
}
```

### Skill
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}
```

### JobPreference
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  role: string (e.g., "Software Engineer")
  keywords: string[] (e.g., ["React", "Node.js"])
  location: string
  remote: boolean
  minSalary: number
  maxSalary: number
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship'
  isActive: boolean
}
```

### PlatformAccount
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  platform: 'linkedin' | 'naukri'
  email: string
  encryptedPassword: string (AES-256)
  isConnected: boolean
  lastActiveAt: Date
  status: 'active' | 'paused' | 'suspended' | 'error'
  sessionData: string (JSON, encrypted)
}
```

### Job
```typescript
{
  id: UUID (PK)
  externalId: string (platform's job ID)
  platform: 'linkedin' | 'naukri'
  title: string
  company: string
  location: string
  description: string
  jobUrl: string
  postedAt: Date
  applicantCount: number
  salary: string
  jobType: string
  isRemote: boolean
}
```

### JobApplication
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  jobId: UUID (FK)
  status: 'applied' | 'viewed' | 'shortlisted' | 'rejected' | 'interview' | 'offered'
  tailoredResumeUrl: string
  tailoredResumeText: string
  appliedAt: Date
  notes: string (match score, highlights)
}
```

## Auto-Apply Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   Cron: Every 5 Minutes                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Get Active Users                                            │
│     • isActive = true                                           │
│     • Has resume uploaded                                       │
│     • Has active preferences                                    │
│     • Has connected platform accounts                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Check Rate Limits                                           │
│     • Max 15 applications/hour                                  │
│     • Max 50 applications/day                                   │
│     • Skip if either limit reached                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Search Jobs (per platform account & preference)             │
│     • Use keywords + location from preferences                  │
│     • Filter: posted < 1 hour ago                               │
│     • Filter: < 10 applicants                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. AI Match Scoring                                            │
│     • Compare resume + skills to job                            │
│     • Score 0-100                                               │
│     • Skip if score < 50                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Tailor Resume (AI)                                          │
│     • Reorder/emphasize existing skills                         │
│     • NEVER add fake information                                │
│     • Return key highlights                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Apply to Job                                                │
│     • Use scraper with stealth browser                          │
│     • Submit tailored resume                                    │
│     • Random delays (3-15 seconds)                              │
│     • Detect errors/captchas                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Record Application                                          │
│     • Save to job_applications                                  │
│     • Store tailored resume text                                │
│     • Save match score & highlights                             │
└─────────────────────────────────────────────────────────────────┘
```

## Anti-Ban Safety Measures

### 1. Browser Stealth
- Use `puppeteer-extra-plugin-stealth` to mask automation fingerprints
- Random user-agent rotation
- Disable webdriver flag

### 2. Rate Limiting
- Per-user: Max 15 applications/hour, 50/day
- Global delays between actions: 3-15 seconds (random)
- Exponential backoff on errors (5s, 10s, 20s, 40s...)

### 3. Session Persistence
- Store encrypted session cookies in database
- Reuse sessions to avoid repeated logins
- Update session data after each action

### 4. Human-like Behavior
- Random scroll patterns
- Random mouse movements
- Varying delay between actions
- Natural typing speed (if manual input needed)

### 5. Safety Detection
- Detect captcha challenges → pause account
- Detect account warnings → pause account
- Detect rate limit responses → exponential backoff
- Detect suspicious activity → mark as suspended

### 6. Auto-Pause Triggers
- Captcha encountered
- Account suspended warning
- Too many failed attempts
- Platform rate limiting detected
- Manual pause by user

## Module Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap + global pipes
│
├── config/                    # Configuration
│   ├── configuration.ts       # Environment config factory
│   ├── env.validation.ts      # class-validator rules
│   └── config.module.ts       # ConfigModule.forRoot()
│
├── database/                  # Database connection
│   └── database.module.ts     # Sequelize + model registration
│
├── common/                    # Shared utilities
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── utils/
│       └── encryption.util.ts # AES-256 encryption
│
├── models/                    # Sequelize models
│   ├── user.model.ts
│   ├── user-profile.model.ts
│   ├── skill.model.ts
│   ├── job-preference.model.ts
│   ├── platform-account.model.ts
│   ├── job.model.ts
│   └── job-application.model.ts
│
├── auth/                      # Authentication
│   ├── auth.module.ts
│   ├── auth.service.ts       # Register, login, JWT generation
│   ├── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
│
├── users/                     # User profile & resume
│   ├── users.module.ts
│   ├── users.service.ts      # Profile CRUD, resume upload
│   ├── users.controller.ts
│   └── dto/
│       └── update-profile.dto.ts
│
├── skills/                    # Skills management
│   ├── skills.module.ts
│   ├── skills.service.ts
│   ├── skills.controller.ts
│   └── dto/
│       └── create-skill.dto.ts
│
├── job-preferences/           # Job search preferences
│   ├── job-preferences.module.ts
│   ├── job-preferences.service.ts
│   ├── job-preferences.controller.ts
│   └── dto/
│       └── create-job-preference.dto.ts
│
├── platform-accounts/         # LinkedIn/Naukri linking
│   ├── platform-accounts.module.ts
│   ├── platform-accounts.service.ts  # Encrypt/decrypt credentials
│   ├── platform-accounts.controller.ts
│   └── dto/
│       └── link-account.dto.ts
│
├── jobs/                      # Job listings
│   ├── jobs.module.ts
│   ├── jobs.service.ts       # Upsert, find, query jobs
│   └── jobs.controller.ts
│
├── job-applications/          # Applications tracking
│   ├── job-applications.module.ts
│   ├── job-applications.service.ts
│   └── job-applications.controller.ts
│
├── ai/                        # AI services
│   ├── ai.module.ts
│   └── ai.service.ts         # Resume tailoring, job matching
│
├── scrapers/                  # Job platform scrapers
│   ├── scrapers.module.ts
│   ├── base-scraper.service.ts      # Abstract base class
│   ├── linkedin-scraper.service.ts  # LinkedIn implementation
│   └── naukri-scraper.service.ts    # Naukri implementation
│
├── auto-apply/                # Auto-apply engine
│   ├── auto-apply.module.ts
│   └── auto-apply.service.ts # Cron job, orchestration
│
└── dashboard/                 # User dashboard
    ├── dashboard.module.ts
    ├── dashboard.service.ts  # Stats, recent apps
    └── dashboard.controller.ts
```

## Environment Variables

See `.env.example` for complete configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | PostgreSQL user | postgres |
| `DB_PASSWORD` | PostgreSQL password | postgres |
| `DB_NAME` | Database name | early_edge |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRATION` | JWT token expiry | 7d |
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `ENCRYPTION_KEY` | AES-256 key for credentials | (required, 32 chars) |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `MAX_APPLICATIONS_PER_HOUR` | Rate limit | 15 |
| `MAX_APPLICATIONS_PER_DAY` | Daily limit | 50 |
| `MIN_DELAY_SECONDS` | Min action delay | 3 |
| `MAX_DELAY_SECONDS` | Max action delay | 15 |

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Stateless, expires in 7 days
3. **Credential Encryption**: AES-256-GCM for platform passwords
4. **Input Validation**: class-validator on all DTOs
5. **Global Guards**: JWT required for protected endpoints
6. **CORS Enabled**: Configured for frontend origins

## Future Enhancements

- Real browser automation with puppeteer-extra
- OAuth integration for LinkedIn/Naukri
- Email notifications for application status
- Webhook callbacks for status updates
- Analytics dashboard with charts
- Multi-language support
- Cover letter generation
- Job alert emails

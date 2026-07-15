# 🗄️ Database Documentation

PrepPilot AI utilizes MongoDB (via Mongoose ODM) for all data persistence. 

## Collections Overview

| Collection | Purpose |
|------------|---------|
| `users` | Stores authentication credentials and profile data. |
| `resumes` | Stores parsed resume text, ATS scores, and AI feedback. |
| `mockinterviews` | Stores entire interview sessions including Q&A and grading. |
| `dsatrackings` | Logs daily DSA problem solving metrics and streaks. |
| `roadmaps` | Stores AI-generated weekly study plans. |
| `notes` | Stores rich-text markdown notes taken by the user. |

---

## 1. User Schema (`users`)
**Purpose**: Handles authentication and account linkage.

```javascript
{
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```
*Index*: `email` is indexed as `unique` to prevent duplicate registrations.

---

## 2. Resume Schema (`resumes`)
**Purpose**: Stores AI evaluations of uploaded PDFs.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFilename: { type: String },
  parsedText: { type: String },
  atsScore: { type: Number },
  missingSkills: [{ type: String }],
  grammarSuggestions: [{ type: String }],
  keywordOptimization: [{ type: String }],
  improvements: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}
```
*Relationship*: Belongs to one `User`.

---

## 3. Mock Interview Schema (`mockinterviews`)
**Purpose**: Maintains a ledger of dynamic AI interviews.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'HR', 'Technical', 'Behavioral'
  category: { type: String },
  status: { type: String, enum: ['InProgress', 'Completed'], default: 'InProgress' },
  overallScore: { type: Number, default: 0 },
  history: [
    {
      question: { type: String },
      expectedAnswerKeywords: [{ type: String }],
      userAnswer: { type: String },
      score: { type: Number },
      feedback: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. DSA Tracking Schema (`dsatrackings`)
**Purpose**: Tracks daily algorithm practice metrics.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  problemsSolved: { type: Number, default: 0 },
  difficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  topics: [{ type: String }],
  notes: { type: String }
}
```
*Index*: Compound unique index on `{ user: 1, date: 1 }` ensuring only one record per user per day.

---

## 5. Roadmap Schema (`roadmaps`)
**Purpose**: Persists AI-generated study timelines.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetCompany: { type: String },
  durationWeeks: { type: Number },
  weeks: [
    {
      weekNumber: { type: Number },
      weeklyGoal: { type: String },
      dailyTasks: [{ type: String }]
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

---

## Validation & Security
- **Mongoose strict mode** is enabled by default to strip out unauthorized fields before saving.
- Input is sanitized implicitly by Mongoose typing casting. 
- API endpoints verify the `req.user.id` matches the document `user` ref to enforce multitenant isolation.

# Project Requirements Document (PRD)

## 1. Project Overview

We’re building a web platform to register and assess students for an introductory AI masterclass. Students sign up by providing their full name, date of birth, email, and WhatsApp number. Right after signing up, they take a 10-question multiple-choice quiz (QCM) on the masterclass topic. Their results and corrections appear immediately, and successful completion automatically validates their registration. After the masterclass, students take a similar post-test to measure their progress. All data lives in Supabase, and administrators plus tutors can view registrations, pre- and post-test scores via a dashboard.

The main goal is to streamline enrollment, pre-screen students’ knowledge, and track learning outcomes—all without manual work. Success means students can register and test themselves end-to-end in under five minutes; admins can see real-time stats; and the system scales to future masterclasses or themes with minimal changes.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)

*   Student registration form (name, surname, DOB, email, WhatsApp).
*   Pre-masterclass QCM (10 multiple-choice questions, one attempt, no timer).
*   Immediate score and detailed corrections after submission.
*   Automatic registration validation upon test completion.
*   Storage of registrations and test results in Supabase.
*   Post-masterclass QCM with identical rules.
*   WhatsApp notifications via Whapi API (confirmation, reminders, results).
*   Admin/tutor dashboard (view, filter, export data; role-based access).
*   Question bank module: import PDF draft to auto-generate questions via GPT-4o and manual edits.
*   French-language interface, responsive design, modern styling (blue/white/green, Inter font).

### Out-of-Scope (Phase 1)

*   Paid registration or manual admin approval workflows.
*   Multilingual support beyond French.
*   Time-limited or repeatable test attempts.
*   In-depth analytics (charts, trends) beyond CSV export.
*   Mobile app or native client—web only.
*   Offline mode or progressive web app (PWA).
*   Integration with other messaging channels (email only via WhatsApp for now).

## 3. User Flow

A new student visits the home page, sees a short overview of the AI masterclass, and clicks “S’inscrire.” They fill out their personal details (full name, date of birth, email, WhatsApp). Upon submitting, the platform creates a Supabase Auth user and inserts a record into the “inscriptions” table. The student is then immediately redirected to the pre-masterclass QCM.

On the QCM page, the student answers 10 multiple-choice questions generated dynamically from the uploaded PDF via GPT-4o. Once they submit, the system calculates the score, shows a detailed correction, and marks their registration as valid. A confirmation WhatsApp message is sent automatically. After attending the masterclass, the student receives another WhatsApp link to take the post-test. Finally, admins and tutors log into a secure dashboard (via Supabase Auth) to filter, view, and export all student records and scores.

## 4. Core Features

*   **Student Registration**

    *   Collect full name, surname, date of birth, email, WhatsApp.
    *   Create Supabase Auth user and store profile in “inscriptions” table.

*   **Pre-Masterclass QCM**

    *   10 questions, multiple choice, one attempt per student, no timer.
    *   Questions auto-generated from PDF draft via GPT-4o.
    *   Instant display of score and detailed corrections.

*   **Automatic Validation & Notifications**

    *   Mark registration valid after pre-test success.
    *   Send WhatsApp confirmation, reminder of masterclass date, and test results via Whapi API.

*   **Post-Masterclass QCM**

    *   Same rules as pre-test; measures student progress.
    *   Immediate score and corrections; store results separately.

*   **Question Bank Management**

    *   Import PDF draft to generate new QCM items with GPT-4o.
    *   Manual CRUD interface for questions stored in Supabase “questions” table.

*   **Dashboard for Admins & Tutors**

    *   Role-based access (admin vs. tutor).
    *   Paginated, filterable list of students and their pre/post scores.
    *   CSV export of data.

*   **Styling & UX**

    *   Modern, clean UI with Tailwind CSS and shadcn components.
    *   Color palette: dark blue, white, green accents.
    *   Font: Inter.

*   **Compliance**

    *   Data handling in line with Gabon’s personal data regulations (local RGPD).
    *   French interface only.

## 5. Tech Stack & Tools

*   **Frontend**

    *   Next.js 14 (App Router)
    *   TypeScript
    *   Tailwind CSS + shadcn UI components
    *   Inter font

*   **Backend & Data**

    *   Supabase

        *   Authentication (email/password)
        *   PostgreSQL database
        *   Storage (if we store PDFs or assets)

*   **AI & Notifications**

    *   GPT-4o for question generation
    *   Whapi WhatsApp API for messaging

*   **Development Tools**

    *   VS Code (with Cursor or Windsurf extensions)
    *   Git for version control
    *   Postman or Supabase Studio for API/DB inspection

## 6. Non-Functional Requirements

*   **Performance**

    *   Page load (First Contentful Paint) < 1 s on desktop.
    *   API calls (e.g., Supabase queries) < 200 ms average.

*   **Security**

    *   HTTPS/TLS everywhere.
    *   Data encryption at rest (Supabase defaults).
    *   Role-based access control via Supabase policies.

*   **Usability**

    *   Responsive design for mobile and desktop.
    *   Clear error messages and form validation.

*   **Compliance**

    *   Store and process personal data according to Gabon’s data protection laws.
    *   Privacy policy link in footer.

## 7. Constraints & Assumptions

*   GPT-4o access and token limits are available to generate questions.
*   Whapi API credentials and rate limits in place for WhatsApp notifications.
*   PDF drafts are in a format parseable by the AI model (text-based, not scanned images).
*   All users will use the French interface; no translation needed now.
*   Platform hosted where Supabase is supported (region compatibility).

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits**

    *   GPT-4o may throttle large PDF imports—batch or cache results.
    *   Whapi may limit messages per minute—implement retry logic.

*   **Question Quality**

    *   AI-generated questions may need manual review—provide editing UI.

*   **PDF Parsing**

    *   Complex formatting might break generation—fallback to manual entry.

*   **Data Integrity**

    *   Ensure atomic transactions: registration + test + notifications must roll back on failure.

*   **Scalability**

    *   Large cohorts require pagination and indexed DB queries.
    *   Monitor Supabase row limits and upgrade plan if needed.

By following this PRD, the AI model and developers will have a crystal-clear reference to implement, extend, and maintain the masterclass registration and evaluation platform without guesswork.

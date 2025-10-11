# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new visitor arrives on the platform, they first land on a clean, modern homepage that introduces the AI masterclass. A prominent button invites prospective students to register. By clicking this button, the visitor is taken to the student registration page. Here the student enters their full name, first name, date of birth, email address, and WhatsApp number into a simple form styled with the Inter font. As soon as the form is submitted, the system uses Supabase to record the student’s personal details in the “inscriptions” table and then immediately redirects them to the first QCM test. No password is required for students to take their one allowed attempt, keeping the process frictionless.

Administrators and tutors access their own sign-in page via a separate link. They authenticate through Supabase Auth by providing their email and password. If they forget their password, they click a clearly labeled “Forgot Password” link which prompts them to enter their email. Supabase then sends a password reset email automatically. Once signed in, admins and tutors can log out at any time by clicking their profile icon and choosing “Sign Out,” returning them to the public homepage.

## Main Dashboard or Home Page

After administrators or tutors successfully sign in, they land on the main dashboard. The top header displays the platform logo and the user’s name with a sign-out button. Along the left side, a vertical navigation menu lists links to “Students,” “Test Results,” “Question Bank,” and “Settings.” The central area features key widgets: a summary of total registrations, a chart of pre- and post-test scores, and a recent activity feed showing new student sign-ups and completed tests. From this dashboard, administrators click menu items to switch instantly to detailed views without leaving the main layout.

Students never see this admin dashboard. Instead, once they complete their registration form, they are taken directly to the QCM test interface. They do not have a separate “home” page beyond the test and confirmation screens.

## Detailed Feature Flows and Page Transitions

When a student finishes filling out the registration form, they are automatically directed to the Pre-Masterclass QCM page. This page presents ten multiple-choice questions generated on the fly by the integrated GPT-4o AI model using the uploaded PDF outline. There is no timer, and the student cannot revisit or refresh the test once started. After selecting answers, the student clicks “Submit.” Instantly, the interface shows their score at the top and a full corrected answer key below, color-coded in green for correct choices and blue for explanations. At this moment, Supabase saves both the student’s details and test results in the database. Simultaneously, the platform calls the Whapi API to send a WhatsApp message confirming the successful registration and reminding the student of the masterclass date.

On the day after the masterclass, the student receives another WhatsApp message with a secure link to the Post-Masterclass QCM. Clicking the link brings them back to a nearly identical ten-question test page. Again, they answer without time pressure, submit only once, and immediately view their progression score and detailed corrections. These results are stored separately so that performance before and after the class can be compared.

Administrators and tutors manage these records from the “Students” section in the dashboard. Clicking on a student’s name opens a detailed profile page showing personal data, pre- and post-test scores, timestamps, and any notes added by staff. From this profile view, admins can export the student’s data as CSV or trigger a manual WhatsApp reminder if needed.

The “Question Bank” link leads to a page where admins upload a new PDF of course material. Upon upload, the system calls the AI model to generate fresh QCM questions and displays them in an editable table. Admins can modify question text, adjust answer choices, or delete entries. Saving commits changes to the “questions” table in Supabase, making them available for future tests.

## Settings and Account Management

Under the “Settings” menu, administrators can update their own profile information, including name, email, and password. They can configure the WhatsApp API credentials and review the default message templates used for registration confirmations and test invitations. A separate section allows toggling bilingual support, though the platform currently operates only in French. From any settings page, a “Back to Dashboard” link returns the user to the main overview without losing context.

## Error States and Alternate Paths

If a student submits an incomplete registration form, inline error messages appear in red under each required field, explaining what needs correction. If the system loses connectivity during the QCM, a full-screen alert notifies the student that their session is interrupted and asks them to retry once the connection returns. In the rare case the AI generation of questions fails, the platform falls back to a default set of sample questions and notifies the admin to resolve the issue later.

Students who attempt to retake either pre- or post-test see a clear message stating that only one attempt is permitted. This message includes a link back to the public homepage. For administrators, failed login attempts trigger a standard “Invalid credentials” error. After multiple failures, Supabase locks the account temporarily and prompts a password reset.

## Conclusion and Overall App Journey

From the very first click on the landing page through registration, automated pre-test evaluation, and post-class reassessment, the student follows a seamless, guided path that ensures data collection and immediate feedback. Administrators and tutors enjoy a structured dashboard that centralizes student records, test results, and question bank management. All personal data and test details live securely in Supabase, while WhatsApp notifications keep students informed at each key step. This flow can easily be extended to new masterclasses by uploading different PDFs, generating new questions, and repeating the same proven cycle for each subject area.
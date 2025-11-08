# Exam Management System - Documentation

## Overview
The Exam Management System allows administrators to:
1. Create exams with hall assignments
2. Assign teachers to inspect and correct papers
3. Create section-wise exam timetables for students

## Database Schema

### Tables Created

#### 1. `exam_schedule` (Enhanced)
Main exam table with additional columns:
- `exam_id` - Primary key
- `title` - Exam title (e.g., "Mid Term Exam - I")
- `exam_date` - Date of the exam
- `start_time` - Start time
- `end_time` - End time
- `course_id` - Related course
- `section_id` - Related section (NEW)
- `hall` - Exam hall/venue
- `exam_type` - Type of exam (Regular, Mid Term, Final, Supplementary) (NEW)
- `faculty_id` - Primary invigilator (optional)
- `paper` - Paper details (optional)

#### 2. `exam_teacher_assignment`
Tracks which teachers are assigned to inspect/correct exams:
- `teacher_assignment_id` - Primary key
- `exam_id` - Foreign key to exam_schedule
- `faculty_id` - Foreign key to faculty
- `course_id` - Course/subject they're assigned for
- `role_type` - ENUM('inspector', 'corrector', 'both')

#### 3. `exam_timetable`
Section-wise exam timetable entries:
- `timetable_id` - Primary key
- `exam_id` - Foreign key to exam_schedule (optional)
- `section_id` - Foreign key to section
- `course_id` - Foreign key to course
- `exam_date` - Date of the exam
- `start_time` - Start time
- `end_time` - End time
- `hall` - Exam hall/venue
- `instructions` - Special instructions for the exam

## API Endpoints

### 1. Create Exam
**POST** `/api/exams`

Request body:
```json
{
  "title": "Mid Term Exam - I",
  "exam_date": "2025-12-15",
  "start_time": "09:00:00",
  "end_time": "12:00:00",
  "course_id": 1,
  "section_id": 1,
  "hall": "Main Hall A",
  "exam_type": "Mid Term",
  "teacher_assignments": [
    {
      "faculty_id": 1,
      "course_id": 1,
      "role_type": "both"
    }
  ]
}
```

### 2. Get All Exams
**GET** `/api/exams`

Returns list of all exams with course, section, and faculty details.

### 3. Get Exam Details
**GET** `/api/exams/:examId`

Returns exam details including all teacher assignments.

### 4. Assign Teacher to Exam
**POST** `/api/exams/:examId/assign-teacher`

Request body:
```json
{
  "faculty_id": 1,
  "course_id": 1,
  "role_type": "both"
}
```

### 5. Create Timetable Entry
**POST** `/api/exam-timetable`

Request body:
```json
{
  "exam_id": 1,
  "section_id": 1,
  "course_id": 1,
  "exam_date": "2025-12-15",
  "start_time": "09:00:00",
  "end_time": "12:00:00",
  "hall": "Main Hall A",
  "instructions": "Arrive 15 minutes early"
}
```

### 6. Get Timetable for Section
**GET** `/api/exam-timetable/section/:sectionId`

Returns all exam timetable entries for a specific section.

### 7. Get All Timetables
**GET** `/api/exam-timetable`

Returns all exam timetables (admin view).

### 8. Delete Exam
**DELETE** `/api/exams/:examId`

Deletes an exam (cascades to assignments and timetables).

### 9. Get Teacher's Assigned Exams
**GET** `/api/teacher-exams/:facultyId`

Returns all exams assigned to a specific teacher.

## Frontend Component

### ExamManagement Component
Located at: `src/components/ExamManagement.jsx`

Features:
- **Create Exam Tab**: Create new exams with hall and teacher assignments
- **Assign Teachers Tab**: Assign teachers to existing exams
- **Exam Timetable Tab**: Create section-wise timetable entries
- **View Exams Tab**: View and manage all exams

The component is integrated into the admin navigation in App.jsx.

## Setup Instructions

### 1. Run Database Setup
```bash
cd backend
node setup_exam_tables.js
```

This creates the necessary tables.

### 2. Add Missing Columns (if needed)
```bash
node add_exam_columns.js
```

### 3. Seed Sample Data (Optional)
```bash
node seed_exam_data.js
```

This creates 3 sample exams with teacher assignments and timetables.

### 4. Start Backend Server
```bash
node server.js
```

The exam endpoints will be available at `http://localhost:3001/api/exams`

### 5. Access Admin Panel
1. Login as admin
2. Navigate to "Exam Management" in the sidebar
3. Use the tabs to create exams, assign teachers, and manage timetables

## Usage Flow

### Creating an Exam
1. Go to "Create Exam" tab
2. Fill in exam details (title, date, time, course, section, hall, type)
3. Optionally add teacher assignments inline
4. Submit to create the exam

### Assigning Teachers
1. Go to "Assign Teachers" tab
2. Select an existing exam
3. Choose a teacher and course/subject
4. Select role (Inspector, Corrector, or Both)
5. Submit to assign

### Creating Timetables
1. Go to "Exam Timetable" tab
2. Optionally link to an existing exam
3. Select section and course
4. Enter date, time, hall, and instructions
5. Submit to create timetable entry

Students can view their section's exam timetable through the student portal.

## Features

✅ Create exams with hall assignments
✅ Assign multiple teachers to inspect/correct papers
✅ Section-wise exam timetables
✅ Support for different exam types (Mid Term, Final, etc.)
✅ Teacher role specification (Inspector/Corrector)
✅ View and manage all exams
✅ Delete exams with cascade cleanup
✅ Teacher dashboard to view assigned exams
✅ Dark mode support
✅ Responsive design

## Future Enhancements

- [ ] Bulk timetable creation for multiple sections
- [ ] Exam result entry interface
- [ ] Student exam registration system
- [ ] Hall capacity management
- [ ] Seating arrangement generation
- [ ] Exam notification system
- [ ] PDF export for timetables
- [ ] Clash detection for exam schedules

## Notes

- All times are in 24-hour format (HH:MM:SS)
- Dates are in YYYY-MM-DD format
- Section information is concatenated from section_no, term, and year
- Deleting an exam automatically deletes related teacher assignments and timetable entries (CASCADE)
- Teacher assignments use UNIQUE constraint to prevent duplicate assignments

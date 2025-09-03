dan# TODO: Implement Attendance Feature

## Overview
Implement a comprehensive attendance tracking system for the e-learning platform that allows teachers to mark student attendance and students to view their attendance records.

## Database Changes
- [ ] Create attendance table in database-schema.sql
- [ ] Add attendance model (server/models/Attendance.js)

## Backend Implementation
- [ ] Create attendance controller (server/controllers/attendanceController.js)
- [ ] Create attendance routes (server/routes/attendanceRoutes.js)
- [ ] Update server/app.js to include attendance routes
- [ ] Add attendance API endpoints to client/src/services/api.js

## Frontend Implementation
- [ ] Enable attendance tab in DetailKelas.js
- [ ] Create attendance UI components for teachers (mark attendance)
- [ ] Create attendance UI components for students (view attendance)
- [ ] Add attendance state management to DetailKelas.js

## Features to Implement
- [ ] Teachers can view list of enrolled students for a class
- [ ] Teachers can mark students as present/absent for current session
- [ ] Students can view their attendance history
- [ ] Teachers can view attendance reports for their classes
- [ ] Real-time attendance status updates

## Security & Validation
- [ ] Ensure only teachers can mark attendance for their classes
- [ ] Ensure only enrolled students can view attendance for their classes
- [ ] Validate attendance data before saving

## Testing
- [ ] Test attendance marking functionality
- [ ] Test attendance viewing for students
- [ ] Test attendance reports for teachers
- [ ] Test error handling and edge cases

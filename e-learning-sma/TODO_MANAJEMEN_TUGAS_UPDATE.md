# TODO: Update ManajemenTugas.js - Class Selection Flow

## Overview
Update ManajemenTugas.js to follow the same pattern as ManajemenMateri.js where teachers must select a class first before being able to create assignments.

## Current State
- ManajemenTugas.js shows a modal for creating assignments with a class selection dropdown
- The "Buat Tugas Baru" button is always enabled
- Class selection is done inside the modal

## Target State
- Show list of teacher's classes first
- When a class is clicked, show assignments for that class
- Only then show the "Buat Tugas Baru" button
- kelas_id is automatically set from selectedClass.id

## Implementation Steps
- [x] Create TODO file with implementation plan
- [x] Add state for teacherClasses, selectedClass, classAssignments
- [x] Add useEffect to fetch teacher classes on component mount
- [x] Add function to fetch assignments by class
- [x] Add handleClassClick function to select class and fetch assignments
- [x] Add handleBackToClasses function to return to class list
- [x] Update useEffect to set kelas_id when selectedClass changes
- [x] Update render logic to show class list first, then assignments
- [x] Remove class selection dropdown from modal
- [x] Update modal to use selectedClass.id for kelas_id
- [x] Test the flow: select class -> view assignments -> create new assignment

## Status: COMPLETED ✅
The ManajemenTugas.js file has already been updated to follow the same pattern as ManajemenMateri.js. Teachers must now:
1. Select a class from the list first
2. View assignments for that class
3. Only then can create new assignments (kelas_id is automatically set)

## Files to Modify
- e-learning-sma/client/src/pages/ManajemenTugas.js

## Dependencies
- classesAPI.getTeacherClasses()
- assignmentsAPI.getByClass(classId)
- assignmentsAPI.create()
- assignmentsAPI.update()
- assignmentsAPI.delete()

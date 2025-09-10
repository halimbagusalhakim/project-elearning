# TODO: Fix Admin Assignment Loading Issue

## Overview
Fix the admin task management menu that fails to load tasks by implementing the missing `getAll` functionality for assignments.

## Current State
- Admin task management menu shows "Gagal memuat tugas" (Failed to load tasks)
- Frontend calls `assignmentsAPI.getAll()` but method doesn't exist
- No backend endpoint for getting all assignments for admin

## Target State
- Admin can view all assignments from all classes
- Assignments display with class information and creator details
- CRUD operations work properly for admin

## Implementation Steps
- [x] Add `getAll` method to `Assignment` model
- [x] Add `getAllAssignments` controller function
- [x] Add `GET /api/assignments` route (admin only)
- [x] Add `getAll` method to `assignmentsAPI` in `api.js`
- [ ] Test admin task management page loads assignments
- [ ] Verify CRUD operations work for admin

## Files to Modify
- `server/models/Assignment.js`
- `server/controllers/assignmentController.js`
- `server/routes/assignmentRoutes.js`
- `client/src/services/api.js`

## Status: IMPLEMENTATION COMPLETE - READY FOR TESTING

## Implementation Summary:
✅ **Added `getAll` method to Assignment model** - Fetches all assignments with class and creator information
✅ **Added `getAllAssignments` controller function** - Admin-only endpoint with authorization check
✅ **Added `GET /api/assignments` route** - Protected admin route for fetching all assignments
✅ **Added `getAll` method to assignmentsAPI** - Frontend API method for admin to fetch assignments

## What This Fixes:
- Admin can now view all assignments from all classes
- Assignments display with class name, creator name, and submission counts
- The "Gagal memuat tugas" error should be resolved
- Admin can perform CRUD operations on any assignment

## Next Steps:
- [ ] Test admin task management page loads assignments
- [ ] Verify CRUD operations work for admin
- [ ] Check database has assignment data
- [ ] Ensure admin user is properly authenticated

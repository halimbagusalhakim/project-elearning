# TODO: Debug "Tugas Saya" Feature

## Issue
The "Tugas Saya" feature is not loading assignments for students. The page shows "Belum ada tugas" (No assignments yet) even when there should be assignments.

## Debugging Steps Added
- [x] Added detailed logging in backend controller `getStudentAssignments`
- [x] Added logging in Assignment model `getByStudentId` method
- [x] Added logging in frontend `TugasSaya.js` component
- [x] Added authentication middleware logging to trace auth issues
- [x] Added role authorization logging to check user permissions

## Next Steps
- [x] Test the application and check server logs
- [x] Check if student is enrolled in classes with approved status
- [x] Check if there are assignments in the enrolled classes
- [x] Verify JWT token is being sent correctly
- [x] Check database for sample data

## Potential Issues to Check
1. **Student Enrollment**: Student may not be enrolled in any classes or enrollment status is not 'approved'
2. **No Assignments**: There may be no assignments created in the classes the student is enrolled in
3. **Database Connection**: Database may not have the required tables or data
4. **JWT Token**: Authentication token may be missing or invalid
5. **API Endpoint**: The endpoint may not be returning data due to query issues

## Sample Data Created
- [x] Students enrolled in classes with status 'approved'
- [x] Assignments created in enrolled classes
- [x] Sample submissions added

## Testing Commands
```bash
# Start server
cd server && npm start

# Start client
cd client && npm start

# Check server logs for debugging output
```

## Expected Log Output
When working correctly, you should see:
1. Backend: "getStudentAssignments called for user: {userId, userRole, userName}"
2. Backend: "getByStudentId called with studentId: X"
3. Backend: "SQL query result: {rowCount: N, rows: [...]}" (N > 0)
4. Frontend: "API response received: {status: 200, dataLength: N}" (N > 0)
5. Frontend: "Setting assignments state with N assignments"

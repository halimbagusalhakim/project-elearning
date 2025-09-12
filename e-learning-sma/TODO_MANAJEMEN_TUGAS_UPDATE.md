# TODO: Fix Admin Class Dropdown in "Tambah Tugas Baru" Modal

## Issue
- When admin tries to create a new assignment, the class dropdown shows "Tidak ada kelas tersedia".
- The frontend state `teacherClasses` is used for both teacher and admin, which is confusing.
- Admin classes are fetched via `fetchAllClasses()` but may not be set or rendered properly.

## Plan
1. Rename `teacherClasses` state to `availableClasses` or separate states for admin and teacher classes.
2. Ensure `fetchAllClasses()` sets the correct state for admin.
3. Update the dropdown in the modal to use the correct state based on user role.
4. Add loading and error handling for class fetching.
5. Test the dropdown for admin and teacher roles to confirm classes appear correctly.

## Dependent Files
- `client/src/pages/ManajemenTugas.js`

## Follow-up
- Implement the above changes.
- Test UI and API integration.
- Fix any related bugs or UI issues.

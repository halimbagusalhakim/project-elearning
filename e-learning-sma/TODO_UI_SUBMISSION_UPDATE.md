# TODO: Update UI for Assignment Submission

## Task Description
Update the UI in `TugasSaya.js` so that after submitting an assignment:
- The submit button disappears
- Edit and Delete buttons appear for the submitted assignment
- Grading status is displayed

## Changes Made
- [x] Modified `TugasSaya.js` to import necessary hooks and APIs
- [x] Added state for submissions data
- [x] Updated `fetchMyAssignments` to fetch submission details for grading status
- [x] Added `handleEdit` function to navigate to assignment detail page
- [x] Added `handleDelete` function to delete submissions with confirmation
- [x] Updated card footer UI:
  - Hide submit button for submitted assignments
  - Show "Edit Tugas" and "Hapus Tugas" buttons
  - Display grading status ("Dinilai (grade)" or "Belum dinilai")
- [x] Made "Kerjakan Tugas" button navigate to detail page

## Files Modified
- `e-learning-sma/client/src/pages/TugasSaya.js`

## Testing
- [ ] Test UI changes for unsubmitted assignments (should show submit button)
- [ ] Test UI changes for submitted assignments (should show edit/delete buttons and grading status)
- [ ] Test edit functionality (navigates to detail page)
- [ ] Test delete functionality (deletes submission after confirmation)
- [ ] Test grading status display for graded and ungraded submissions

## Notes
- Grading status is fetched from submission data
- Edit navigates to existing `DetailTugas.js` page which already supports editing
- Delete uses existing submissionsAPI.delete method

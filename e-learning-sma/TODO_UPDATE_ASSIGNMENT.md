# TODO: Fix Update Assignment Functionality

## Issues Identified:
1. Edit modal missing deadline field
2. Server doesn't handle missing fields properly
3. File path overwritten when no new file uploaded

## Tasks:
- [x] Add deadline field to edit modal in ManajemenTugas.js
- [x] Update editData state to include deadline
- [x] Modify handleEditInputChange to handle deadline
- [x] Update handleUpdateAssignment to send deadline
- [x] Modify server updateAssignment to handle missing fields
- [x] Update Assignment.update method to only update provided fields
- [x] Test the update functionality

## Status: Completed

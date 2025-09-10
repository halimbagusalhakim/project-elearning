# TODO: Update Manajemen Materi for Admin

## Overview
Enhance the material management page to load all materials and allow admin to add materials by selecting teacher and class.

## Tasks

### Backend Changes
- [ ] Add `getAllMaterials` method to Material model
- [ ] Add `getAllMaterials` controller function
- [ ] Update `createMaterial` to accept `created_by` from request body for admin
- [ ] Ensure routes are set up for `/materials/all` (admin only)
- [ ] Add API endpoint to get all teachers (if not exists)
- [ ] Add API endpoint to get all classes (if not exists)

### Frontend Changes
- [ ] Update `materialsAPI` to include `getAll` method
- [ ] Update `ManajemenMateri.js` to:
  - Check user role (admin vs teacher)
  - For admin: Load all materials instead of per class
  - For admin: Show teacher and class selection dropdowns when adding material
  - Fetch all teachers and classes for dropdowns
  - Update create form to include teacher and class selection
- [ ] Test the admin flow: add material with selected teacher and class

## Files to Edit
- e-learning-sma/server/models/Material.js
- e-learning-sma/server/controllers/materialController.js
- e-learning-sma/server/routes/materialRoutes.js
- e-learning-sma/client/src/services/api.js
- e-learning-sma/client/src/pages/ManajemenMateri.js
- Possibly e-learning-sma/server/controllers/adminController.js (for teachers endpoint)
- Possibly e-learning-sma/server/routes/adminRoutes.js (for teachers endpoint)

## Testing
- [ ] Test as admin: Load all materials
- [ ] Test as admin: Add material with selected teacher and class
- [ ] Test as teacher: Still works as before (per class)

# Publish Tender Feature Implementation

## Completed Tasks
- [x] Backend: Add new route `PUT /api/tenders/:id/publish` in `tenderRoutes.js` to update status from "draft" to "published"
- [x] Frontend: Add `handlePublish` function in `AdminDashboardNew.jsx`
- [x] Frontend: Modify actions column to show Publish button for `tender.status === 'draft'`
- [x] Frontend: Update Close button logic to only show for `tender.status === 'published'`

## Followup Steps
- [ ] Test backend route for publishing (manual testing)
- [ ] Test frontend Publish button functionality (manual testing)
- [ ] Verify that published tenders are visible to regular users
- [ ] Verify that draft tenders remain hidden from regular users

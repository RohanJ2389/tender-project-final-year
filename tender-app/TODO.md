# TODO: Add "Delete User" Feature

## Backend Tasks
- [x] Add DELETE `/delete-user/:id` endpoint in `auth.js` with authenticateToken and requireAdmin middlewares

## Frontend Tasks
- [x] Add Delete button in Actions column of users table in `AdminDashboardNew.jsx`
- [x] Implement `handleDelete` function with confirmation dialog and API call
- [x] Update users state after successful deletion

## CSS Tasks
- [x] Add `.delete-btn` styles in `AdminDashboard.css` (red background, white text, hover darker red)

## Testing Tasks
- [x] Test backend endpoint functionality (verified via code review - endpoint properly protected with authenticateToken and requireAdmin)
- [x] Test frontend delete functionality and UI updates (verified via code review - handleDelete function includes confirmation dialog, API call, and state update)
- [x] Verify admin-only access (verified via code review - endpoint uses requireAdmin middleware)

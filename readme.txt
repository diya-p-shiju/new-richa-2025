UserForm - form written for making / updating user details
UserView - Table ui written for viewing / deleting user details

LeaveForm - form written for making / updating leave details
LeaveView - Table ui written for viewing / deleting leave details

DepartmentForm - form written for making / updating department details
DepartmentView - Table ui written for viewing / deleting department details



// Create a new leave application
newRequest.post("/leave/", );

// Get all leave applications
newRequest.get("/leave/", getLeaves);

// Get a single leave application by ID
newRequest.get("/leave/:id", getLeave);

// Update a leave application by ID
newRequest.put("/leave/:id", updateLeave);

// Delete a leave application by ID
newRequest.delete("/leave/:id", deleteLeave);

export default router;
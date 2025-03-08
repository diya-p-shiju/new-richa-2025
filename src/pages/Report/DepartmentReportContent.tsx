import React from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Divider, Chip
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DepartmentReportContent = ({ reportData }) => {
  if (!reportData || !reportData.leaves) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1">No data available for this department</Typography>
      </Box>
    );
  }
  
  const { leaves, summary, staffStats } = reportData;
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Helper function to determine leave status
  const getLeaveStatus = (leave) => {
    if (leave.status.principalApproval.approved && leave.status.hodApproval.approved) {
      return 'Approved';
    } else if (leave.status.principalApproval.approved === false || leave.status.hodApproval.approved === false) {
      return 'Rejected';
    } else {
      return 'Pending';
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    if (status === 'Approved') return '#4caf50';
    if (status === 'Rejected') return '#f44336';
    return '#ff9800';
  };
  
  // Prepare chart data
  const statusData = [
    { name: 'Approved', value: summary.approvedLeaves },
    { name: 'Pending', value: summary.pendingLeaves },
    { name: 'Rejected', value: summary.rejectedLeaves || 0 }
  ].filter(item => item.value > 0);
  
  const COLORS = ['#4caf50', '#ff9800', '#f44336'];
  
  // Staff comparison data
  const staffComparisonData = staffStats ? 
    staffStats.map(staff => ({
      name: staff.userName,
      leaveDays: staff.totalDaysTaken,
      leaveCount: staff.totalLeaves
    })) : [];
  
  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1 }} /> Department Overview
              </Typography>
              <Typography variant="h5">{summary.totalStaff}</Typography>
              <Typography variant="body2">Total Staff Members</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Average Leave Days/Staff: <strong>{summary.averageLeaveDaysPerStaff}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1 }} /> Leave Summary
              </Typography>
              <Typography variant="h5">{summary.totalDaysTaken}</Typography>
              <Typography variant="body2">Total Leave Days Taken</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Total Applications: <strong>{summary.totalLeaves}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ mr: 1 }} /> Leave Status
              </Typography>
              <Typography variant="body1">
                Approved: <strong>{summary.approvedLeaves}</strong>
              </Typography>
              <Typography variant="body1">
                Pending: <strong>{summary.pendingLeaves}</strong>
              </Typography>
              {summary.rejectedLeaves > 0 && (
                <Typography variant="body1">
                  Rejected: <strong>{summary.rejectedLeaves}</strong>
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Approval Rate: <strong>
                  {summary.totalLeaves > 0 
                    ? ((summary.approvedLeaves / summary.totalLeaves) * 100).toFixed(0) + '%'
                    : '0%'}
                </strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Leave Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="h6" gutterBottom>Leave Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Staff Leave Comparison */}
        {staffComparisonData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="h6" gutterBottom>Staff Leave Comparison</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={staffComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leaveDays" name="Leave Days" fill="#8884d8" />
                  <Bar dataKey="leaveCount" name="Leave Applications" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Staff-wise Statistics */}
      {staffStats && staffStats.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Staff-wise Leave Statistics</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Name</TableCell>
                  <TableCell align="right">Total Applications</TableCell>
                  <TableCell align="right">Total Days</TableCell>
                  <TableCell align="right">Approved</TableCell>
                  <TableCell align="right">Pending</TableCell>
                  <TableCell align="right">Avg. Days/Leave</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffStats.map((staff) => (
                  <TableRow key={staff.userId}>
                    <TableCell>{staff.userName}</TableCell>
                    <TableCell align="right">{staff.totalLeaves}</TableCell>
                    <TableCell align="right">{staff.totalDaysTaken}</TableCell>
                    <TableCell align="right">{staff.approvedLeaves}</TableCell>
                    <TableCell align="right">{staff.pendingLeaves}</TableCell>
                    <TableCell align="right">
                      {staff.totalLeaves > 0 
                        ? (staff.totalDaysTaken / staff.totalLeaves).toFixed(1) 
                        : '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Leave Applications Table */}
      <Box>
        <Typography variant="h6" gutterBottom>Recent Leave Applications</Typography>
        {leaves.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff</TableCell>
                  <TableCell>From Date</TableCell>
                  <TableCell>To Date</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.slice(0, 10).map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.applicant?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(leave.fromDate)}</TableCell>
                    <TableCell>{formatDate(leave.toDate)}</TableCell>
                    <TableCell align="right">{leave.actualLeaveDays}</TableCell>
                    <TableCell>
                      {leave.reason.length > 30 
                        ? `${leave.reason.substring(0, 30)}...` 
                        : leave.reason}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getLeaveStatus(leave)}
                        style={{ 
                          backgroundColor: getStatusColor(getLeaveStatus(leave)),
                          color: 'white'
                        }}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
            No leave applications found
          </Typography>
        )}
        
        {leaves.length > 10 && (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
            Showing 10 of {leaves.length} applications
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DepartmentReportContent;
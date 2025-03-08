import React from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Divider, Chip
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { format } from 'date-fns';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';

const InstitutionReportContent = ({ reportData }) => {
  if (!reportData || !reportData.leaves) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1">No data available for institution report</Typography>
      </Box>
    );
  }
  
  const { leaves, summary, departmentStats, monthlyDistribution } = reportData;
  
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
  
  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#795548'];
  
  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} /> Institution Overview
              </Typography>
              <Typography variant="h5">{summary.totalDepartments}</Typography>
              <Typography variant="body2">Departments</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Total Staff: <strong>{summary.totalStaff}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1 }} /> Leave Summary
              </Typography>
              <Typography variant="h5">{summary.totalDaysTaken}</Typography>
              <Typography variant="body2">Total Leave Days</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Applications: <strong>{summary.totalLeaves}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1 }} /> Staff Metrics
              </Typography>
              <Typography variant="h5">
                {summary.totalStaff > 0 
                  ? (summary.totalDaysTaken / summary.totalStaff).toFixed(1) 
                  : '0'}
              </Typography>
              <Typography variant="body2">Avg. Leave Days/Staff</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Avg. Applications/Staff: <strong>
                  {summary.totalStaff > 0 
                    ? (summary.totalLeaves / summary.totalStaff).toFixed(1) 
                    : '0'}
                </strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1 }} /> Leave Status
              </Typography>
              <Typography variant="body1">
                Approved: <strong>{summary.approvedLeaves}</strong> 
                <span style={{ color: '#757575', fontSize: '0.9rem', marginLeft: '4px' }}>
                  ({summary.totalLeaves > 0 
                    ? ((summary.approvedLeaves / summary.totalLeaves) * 100).toFixed(0) 
                    : 0}%)
                </span>
              </Typography>
              <Typography variant="body1">
                Pending: <strong>{summary.pendingLeaves}</strong>
                <span style={{ color: '#757575', fontSize: '0.9rem', marginLeft: '4px' }}>
                  ({summary.totalLeaves > 0 
                    ? ((summary.pendingLeaves / summary.totalLeaves) * 100).toFixed(0) 
                    : 0}%)
                </span>
              </Typography>
              {summary.rejectedLeaves > 0 && (
                <Typography variant="body1">
                  Rejected: <strong>{summary.rejectedLeaves}</strong>
                  <span style={{ color: '#757575', fontSize: '0.9rem', marginLeft: '4px' }}>
                    ({summary.totalLeaves > 0 
                      ? ((summary.rejectedLeaves / summary.totalLeaves) * 100).toFixed(0) 
                      : 0}%)
                  </span>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Distribution */}
        {monthlyDistribution && monthlyDistribution.length > 0 && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 350 }}>
              <Typography variant="h6" gutterBottom>Monthly Leave Distribution</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={monthlyDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="days" name="Leave Days" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="count" name="Leave Applications" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
        
        {/* Leave Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 350 }}>
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
      </Grid>
      
      {/* Department-wise Statistics */}
      {departmentStats && departmentStats.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Department-wise Leave Statistics</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Staff</TableCell>
                      <TableCell align="right">Leave Applications</TableCell>
                      <TableCell align="right">Total Days</TableCell>
                      <TableCell align="right">Avg Days/Staff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentStats.map((dept) => (
                      <TableRow key={dept.departmentId}>
                        <TableCell>{dept.departmentName}</TableCell>
                        <TableCell align="right">{dept.totalStaff}</TableCell>
                        <TableCell align="right">{dept.totalLeaves}</TableCell>
                        <TableCell align="right">{dept.totalDaysTaken}</TableCell>
                        <TableCell align="right">
                          {dept.totalStaff > 0 
                            ? (dept.totalDaysTaken / dept.totalStaff).toFixed(1) 
                            : '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 350 }}>
                <Typography variant="h6" gutterBottom>Department Leave Comparison</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={departmentStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="departmentName" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalDaysTaken" name="Leave Days" fill="#8884d8" />
                    <Bar dataKey="totalLeaves" name="Applications" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Recent Leave Applications */}
      <Box>
        <Typography variant="h6" gutterBottom>Recent Leave Applications</Typography>
        {leaves.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.slice(0, 15).map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.applicant?.name || 'N/A'}</TableCell>
                    <TableCell>{leave.department?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(leave.fromDate)}</TableCell>
                    <TableCell>{formatDate(leave.toDate)}</TableCell>
                    <TableCell align="right">{leave.actualLeaveDays}</TableCell>
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
        
        {leaves.length > 15 && (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
            Showing 15 of {leaves.length} applications
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default InstitutionReportContent;
import React from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Divider, Chip
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';

const UserReportContent = ({ reportData }) => {
  if (!reportData || !reportData.leaves) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1">No data available for this user</Typography>
      </Box>
    );
  }
  
  const { leaves, summary } = reportData;
  
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
  
  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1 }} /> Total Leave Days
              </Typography>
              <Typography variant="h3">{summary.totalDaysTaken}</Typography>
              <Typography variant="body2">From {summary.totalLeaves} leave applications</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} /> Leave Status
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
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon sx={{ mr: 1 }} /> Leave Metrics
              </Typography>
              <Typography variant="body1">
                Average Days Per Leave: <strong>
                  {summary.totalLeaves > 0 
                    ? (summary.totalDaysTaken / summary.totalLeaves).toFixed(1) 
                    : 0}
                </strong>
              </Typography>
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
      {statusData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
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
      )}
      
      {/* Leave Applications Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Leave Applications</Typography>
        {leaves.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>From Date</TableCell>
                  <TableCell>To Date</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Substitute</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{formatDate(leave.fromDate)}</TableCell>
                    <TableCell>{formatDate(leave.toDate)}</TableCell>
                    <TableCell align="right">{leave.actualLeaveDays}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      {leave.substituteSuggestion?.suggestedUser?.name || 'None'}
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
      </Box>
      
      {/* Approval Timeline */}
      {leaves.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Approval Timeline</Typography>
          <Paper sx={{ p: 2 }}>
            {leaves.map((leave) => (
              <Box key={leave._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle1">
                  Leave from {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: 150 }}>HOD Approval:</Typography>
                    <Chip 
                      label={leave.status.hodApproval.approved ? 'Approved' : 
                            leave.status.hodApproval.approved === false ? 'Rejected' : 'Pending'}
                      size="small"
                      sx={{ 
                        backgroundColor: leave.status.hodApproval.approved ? '#4caf50' : 
                                        leave.status.hodApproval.approved === false ? '#f44336' : '#ff9800',
                        color: 'white'
                      }}
                    />
                    {leave.status.hodApproval.date && (
                      <Typography variant="caption" sx={{ ml: 2 }}>
                        on {formatDate(leave.status.hodApproval.date)}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ width: 150 }}>Principal Approval:</Typography>
                    <Chip 
                      label={leave.status.principalApproval.approved ? 'Approved' : 
                            leave.status.principalApproval.approved === false ? 'Rejected' : 'Pending'}
                      size="small"
                      sx={{ 
                        backgroundColor: leave.status.principalApproval.approved ? '#4caf50' : 
                                        leave.status.principalApproval.approved === false ? '#f44336' : '#ff9800',
                        color: 'white'
                      }}
                    />
                    {leave.status.principalApproval.date && (
                      <Typography variant="caption" sx={{ ml: 2 }}>
                        on {formatDate(leave.status.principalApproval.date)}
                      </Typography>
                    )}
                  </Box>
                  
                  {(leave.status.hodApproval.comments || leave.status.principalApproval.comments) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">Comments:</Typography>
                      {leave.status.hodApproval.comments && (
                        <Typography variant="caption" display="block">
                          HOD: {leave.status.hodApproval.comments}
                        </Typography>
                      )}
                      {leave.status.principalApproval.comments && (
                        <Typography variant="caption" display="block">
                          Principal: {leave.status.principalApproval.comments}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default UserReportContent;
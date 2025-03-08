import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import newRequest from '@/utils/newRequest';
import { useAuth } from '../../components/context/ContextProvider';
import { useData } from '../../components/context/DataProvider';
import { toast } from 'react-toastify';

// Shadcn/UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Icons
import { 
  Filter, 
  RefreshCw, 
  CalendarIcon,
  PrinterIcon,
  X,
  Maximize2,
  Download
} from "lucide-react";

// Report content components
import UserReportContent from './UserReportContent';
import DepartmentReportContent from './DepartmentReportContent';
import InstitutionReportContent from './InstitutionReportContent';

const LeaveReportPage = () => {
  // Get authenticated user data and role
  const { user } = useAuth();
  // Get users and departments data
  const { users, departments, isLoading: dataLoading } = useData();
  
  // Component state
  const [reportType, setReportType] = useState("user"); // "user", "department", "institution"
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Reference for printing
  const reportRef = useRef(null);
  
  // Setup print handler
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Leave_Report_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => toast.success('Report printed successfully!')
  });
  
  // Set initial selections based on user role
  useEffect(() => {
    if (user && departments && departments.length > 0) {
      if (user?.role === 'teaching-staff' || user?.role === 'non-teaching-staff') {
        // Regular users can only see their own reports
        setReportType("user");
        setSelectedUserId(user._id);
      } else if (user.role === 'hod') {
        // HODs default to department report
        setReportType("department");
        setSelectedDepartmentId(user.department);
      } else {
        // Principals/directors default to institution report
        setReportType("institution");
      }
    }
  }, [user, departments]);
  
  // Handle tab change
  const handleReportTypeChange = (value) => {
    setReportType(value);
    // Reset selections when changing report type
    if (value === "user") {
      if (user?.role === 'teaching-staff' || user?.role === 'non-teaching-staff') {
        setSelectedUserId(user._id);
        setSelectedDepartmentId('');
      } else {
        setSelectedUserId('');
        setSelectedDepartmentId('');
      }
    } else if (value === "department") {
      if (user.role === 'hod') {
        setSelectedDepartmentId(user.department);
      } else {
        setSelectedDepartmentId('');
      }
      setSelectedUserId('');
    } else {
      setSelectedDepartmentId('');
      setSelectedUserId('');
    }
    
    // Clear any previously loaded report data
    setReportData(null);
  };
  
  // Filter users based on selected department
  const filteredUsers = selectedDepartmentId 
    ? users.filter(u => u.department === selectedDepartmentId)
    : users;
  
  // Filter departments based on user role
  const accessibleDepartments = user?.role === 'hod'
    ? departments.filter(dept => dept._id === user.department)
    : departments;
  
  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true);
    
    try {
      let endpoint = '';
      let params = {};
      
      // Add date range to params if provided
      if (startDate) params.fromDate = startDate.toISOString();
      if (endDate) params.toDate = endDate.toISOString();
      
      // Determine endpoint based on report type
      if (reportType === "user") {
        if (!selectedUserId) {
          toast.error('Please select a user');
          setIsLoading(false);
          return;
        }
        endpoint = `/report/user/${selectedUserId}`;
      } else if (reportType === "department") {
        if (!selectedDepartmentId) {
          toast.error('Please select a department');
          setIsLoading(false);
          return;
        }
        endpoint = `/report/department/${selectedDepartmentId}`;
      } else {
        endpoint = '/report/institution';
        // Add department filter if selected
        if (selectedDepartmentId) params.department = selectedDepartmentId;
      }
      
      const response = await newRequest.get(endpoint, { params });
      setReportData(response.data);
      setIsDialogOpen(true); // Open dialog when report is ready
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    
    if (reportType === "user") {
      if (user.role === 'teaching-staff' || user.role === 'non-teaching-staff') {
        setSelectedUserId(user._id);
      } else {
        setSelectedUserId('');
        setSelectedDepartmentId('');
      }
    } else if (reportType === "department") {
      if (user.role === 'hod') {
        setSelectedDepartmentId(user.department);
      } else {
        setSelectedDepartmentId('');
      }
    } else {
      setSelectedDepartmentId('');
    }
    
    // Clear any previously loaded report data
    setReportData(null);
  };
  
  // Determine if user can access different report types
  const canAccessUserReports = true; // All roles can access user reports
  const canAccessDepartmentReports = ['hod', 'principal', 'director', 'admin'].includes(user?.role);
  const canAccessInstitutionReports = ['principal', 'director', 'admin'].includes(user?.role);
  
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leave Reports</h1>
      </div>
      
      {/* Report Type Tabs */}
      <Tabs 
        defaultValue={reportType} 
        value={reportType}
        onValueChange={handleReportTypeChange}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="user" 
            disabled={!canAccessUserReports}
          >
            User Report
          </TabsTrigger>
          <TabsTrigger 
            value="department" 
            disabled={!canAccessDepartmentReports}
          >
            Department Report
          </TabsTrigger>
          <TabsTrigger 
            value="institution" 
            disabled={!canAccessInstitutionReports}
          >
            Institution Report
          </TabsTrigger>
        </TabsList>
        
        {/* Filters Card */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Date Range Filters */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={isLoading}
                  maxDate={endDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={isLoading}
                  minDate={startDate}
                />
              </div>
              
              {/* Department Selection */}
              {((reportType === "user" && user?.role !== 'teaching-staff' && user?.role !== 'non-teaching-staff') || 
                 reportType === "department" || 
                 reportType === "institution") && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartmentId || "all"} 
                    onValueChange={(value) => setSelectedDepartmentId(value === "all" ? "" : value)}
                    disabled={user?.role === 'hod' || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectItem value="all">All Departments</SelectItem>
                      {accessibleDepartments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* User Selection */}
              {reportType === "user" && (
                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Select
                    value={selectedUserId || "none"}
                    onValueChange={(value) => setSelectedUserId(value === "none" ? "" : value)}
                    disabled={user?.role === 'teaching-staff' || user?.role === 'non-teaching-staff' || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {(user?.role === 'teaching-staff' || user?.role === 'non-teaching-staff') ? (
                        <SelectItem value={user._id}>
                          {users.find(u => u._id === user._id)?.name || 'Current User'}
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none">Select User</SelectItem>
                          {filteredUsers.map((u) => (
                            <SelectItem key={u._id} value={u._id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Generate Report Button */}
            <div className="flex justify-between mt-6">
              <Button 
                onClick={fetchReport}
                disabled={isLoading || (reportType === "user" && !selectedUserId) || (reportType === "department" && !selectedDepartmentId)}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetFilters}
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              
              {reportData && !isDialogOpen && (
                <Button 
                  variant="secondary"
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full md:w-auto"
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Show Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Report Dialog / Popup */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {reportType === "user" ? 'Individual Leave Report' : 
                 reportType === "department" ? 'Department Leave Report' : 
                 'Institution Leave Report'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {startDate && endDate ? (
                  `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                ) : (
                  'All Time Report'
                )}
                {reportType === "user" && selectedUserId && (
                  <span className="ml-2">
                    User: {users.find(u => u._id === selectedUserId)?.name || 'Unknown User'}
                  </span>
                )}
                {(reportType === "department" || selectedDepartmentId) && (
                  <span className="ml-2">
                    Department: {departments.find(d => d._id === selectedDepartmentId)?.name || 'All Departments'}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex space-x-2">
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint} 
                className="flex items-center gap-1"
              >
                <PrinterIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button> */}
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          <Separator className="my-2" />
          
          {/* Report Content with Scrolling */}
          <div className="flex-1 overflow-y-auto pr-2" ref={reportRef}>
            {reportData ? (
              <div className="p-4">
                {reportType === "user" && (
                  <UserReportContent reportData={reportData} />
                )}
                {reportType === "department" && (
                  <DepartmentReportContent reportData={reportData} />
                )}
                {reportType === "institution" && (
                  <InstitutionReportContent reportData={reportData} />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No report data available</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveReportPage;
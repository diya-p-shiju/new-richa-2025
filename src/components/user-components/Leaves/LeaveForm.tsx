import React, { useReducer, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePicker from "@/components/atomic-Components/CalendarPicker";
import GetUsers from "@/components/atomic-Components/GetSimilarUsers";
import newRequest from "@/utils/newRequest";
import { LeaveRequest } from "./LeaveView"; // Import the type from your LeaveView
import { X } from "lucide-react";

// Define the Leave state type for the form - modified to match your needs
type LeaveFormState = {
  _id: string;
  applicant: string;
  department: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  substituteSuggestion: {
    suggestedUser: string;
    suggestion: string;
  };
  actualLeaveDays: number;
};

const initialState: LeaveFormState = {
  _id: "",
  applicant: "",
  department: "",
  fromDate: new Date(),
  toDate: new Date(),
  reason: "",
  substituteSuggestion: {
    suggestedUser: "",
    suggestion: "",
  },
  actualLeaveDays: 0,
};

type Action = 
  | { type: "_id" | "applicant" | "department" | "reason"; payload: string }
  | { type: "fromDate" | "toDate"; payload: Date }
  | { type: "actualLeaveDays"; payload: number }
  | { type: "updateSubstituteSuggestion"; payload: { name: string; value: string } }
  | { type: "setLeaveData"; payload: Partial<LeaveFormState> };

const reducer = (state: LeaveFormState, action: Action): LeaveFormState => {
  switch (action.type) {
    case "_id":
    case "applicant":
    case "department":
    case "reason":
      return { ...state, [action.type]: action.payload };
    case "fromDate":
    case "toDate":
      return { ...state, [action.type]: action.payload };
    case "updateSubstituteSuggestion":
      return {
        ...state,
        substituteSuggestion: {
          ...state.substituteSuggestion,
          [action.payload.name]: action.payload.value,
        },
      };
    case "actualLeaveDays":
      return { ...state, actualLeaveDays: action.payload };
    case "setLeaveData":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface LeaveFormProps {
  mode: "create" | "update";
  onClose: () => void;
  leave?: LeaveRequest;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ mode, onClose, leave }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debug logs - Detailed debugging for leave data
  console.log("LeaveForm props - mode:", mode);
  console.log("LeaveForm props - leave:", leave);
  if (leave) {
    console.log("Leave ID from props:", leave._id);
  }

  useEffect(() => {
    // Populate applicant and department from localStorage for new leaves
    const applicant = localStorage.getItem("_id") || "";
    const department = localStorage.getItem("department") || "";

    dispatch({ type: "applicant", payload: applicant });
    dispatch({ type: "department", payload: department });

    // If in update mode and have leave data, populate the form
    if (mode === "update" && leave) {
      console.log("Populating form with leave data:", leave);
      console.log("Leave ID being set:", leave._id);
      
      // Explicitly set the ID first to ensure it's captured
      dispatch({ type: "_id", payload: leave._id });
      
      // Then set the rest of the form data
      dispatch({ 
        type: "setLeaveData", 
        payload: {
          _id: leave._id, // Set it again for redundancy
          applicant: leave.applicant?._id || "",
          department: leave.applicant?.department || "",
          fromDate: new Date(leave.fromDate),
          toDate: new Date(leave.toDate),
          reason: leave.reason,
          substituteSuggestion: {
            suggestedUser: leave.substituteSuggestion?.suggestedUser?._id || "",
            suggestion: leave.substituteSuggestion?.suggestion || ""
          },
          actualLeaveDays: leave.actualLeaveDays
        }
      });
      
      // Log the state after update to verify
      console.log("Form state after population:", state);
    }
  }, [mode, leave]); // Do not include state in the dependency array to avoid infinite loops

  // Add a second useEffect to log the state after it's updated
  useEffect(() => {
    console.log("Current form state:", state);
    console.log("Current form _id:", state._id);
  }, [state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "suggestedUser" || name === "suggestion") {
      dispatch({
        type: "updateSubstituteSuggestion",
        payload: { name, value },
      });
    } else if (name === "reason") {
      dispatch({ type: "reason", payload: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Ensure dates are valid Date objects
      const fromDate = state.fromDate instanceof Date ? state.fromDate : new Date(state.fromDate);
      const toDate = state.toDate instanceof Date ? state.toDate : new Date(state.toDate);
      
      // Calculate actual leave days
      const actualLeaveDays = Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24) + 1
      );
      
      // Prepare data for submission
      const leaveData = {
        applicant: state.applicant,
        department: state.department,
        fromDate,
        toDate,
        reason: state.reason,
        substituteSuggestion: {
          suggestedUser: state.substituteSuggestion.suggestedUser,
          suggestion: state.substituteSuggestion.suggestion || "" 
        },
        actualLeaveDays
      };
      
      console.log(`${mode === "create" ? "Creating" : "Updating"} leave with data:`, leaveData);

      let response;
      if (mode === "create") {
        response = await newRequest.post("/leave/", leaveData);
        console.log("Create response:", response.data);
        alert("Leave application created successfully!");
      } else {
        // For update mode, use the leave ID from wherever it's available
        // Try multiple sources to ensure we get an ID
        let idToUse = "";
        
        // First check state
        if (state._id) {
          idToUse = state._id;
          console.log("Using ID from state:", idToUse);
        } 
        // Then check props
        else if (leave && leave._id) {
          idToUse = leave._id;
          console.log("Using ID from props:", idToUse);
        }
        // Last attempt - log error if still not found
        
        if (!idToUse) {
          console.error("No ID found in state or props:", { stateId: state._id, leavePropsId: leave?._id });
          throw new Error("Leave ID not found for update. Please try again or create a new leave.");
        }
        
        console.log("Updating leave with ID:", idToUse);
        response = await newRequest.put(`/leave/${idToUse}`, leaveData);
        console.log("Update response:", response.data);
        alert("Leave application updated successfully!");
      }
      
      setLoading(false);
      onClose(); // Close the form after successful submission
    } catch (err: any) {
      console.error("Failed to process leave application:", err);
      setError(err.response?.data?.message || err.message || "Failed to process leave application. Please try again.");
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    console.log("Selected substitute user:", userId);
    dispatch({
      type: "updateSubstituteSuggestion",
      payload: { name: "suggestedUser", value: userId },
    });
  };

  // Determine the ID to display
  const displayId = state._id || (leave && leave._id) || "Unknown";
  console.log("Display ID in render:", displayId);

  if (loading && mode === "update" && !leave) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
        <Card className="p-6">
          <p>Loading leave data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <Card
        className="overflow-hidden max-w-md w-full rounded-2xl shadow-lg p-4 bg-white"
        style={{
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: "scale(1)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {mode === "create" ? "Create Leave Application" : "Update Leave Application"}
            </CardTitle>
            <Button
              variant="link"
              onClick={onClose}
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500"
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reason */}
            <div>
              <Label htmlFor="reason" className="block text-sm font-medium">
                Reason for Leave
              </Label>
              <Textarea
                placeholder="Type your reason here"
                name="reason"
                value={state.reason}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* From Date */}
            <div>
              <DatePicker
                label="From Date"
                name="fromDate"
                selectedDate={state.fromDate instanceof Date ? state.fromDate : new Date(state.fromDate)}
                onSelect={(date) =>
                  dispatch({ type: "fromDate", payload: date })
                }
              />
            </div>

            {/* To Date */}
            <div>
              <DatePicker
                label="To Date"
                name="toDate"
                selectedDate={state.toDate instanceof Date ? state.toDate : new Date(state.toDate)}
                onSelect={(date) =>
                  dispatch({ type: "toDate", payload: date })
                }
              />
            </div>

            {/* Substitute Suggestion */}
            <div>
              <Label htmlFor="substituteSuggestion" className="block text-sm font-medium">
                Suggest a Substitute
              </Label>
              <GetUsers onSelectUser={handleSelectUser} />
              {state.substituteSuggestion.suggestedUser && (
                <p className="text-sm text-green-600 mt-1">User selected</p>
              )}
            </div>

            {/* Substitute Suggestion Reason */}
            <div>
              <Label htmlFor="suggestion" className="block text-sm font-medium">
                Reason for Substitute Suggestion
              </Label>
              <Textarea
                placeholder="Reason for substitute suggestion"
                name="suggestion"
                value={state.substituteSuggestion.suggestion || ""}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Display current leave ID when in update mode */}
            {mode === "update" && (
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  Updating leave ID: {displayId}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md shadow-sm hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Processing..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </CardFooter>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Card>
    </div>
  );
};

export default LeaveForm;
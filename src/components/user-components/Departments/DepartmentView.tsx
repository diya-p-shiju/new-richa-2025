import { useState } from "react";
import { useData } from "@/components/context/DataProvider"; // Access cached data
import { Button } from "@/components/ui/button";
import newRequest from "@/utils/newRequest";
import DeleteConfirmation from "../Misc-Pages/DeleteConfirmation";
import DepartmentForm from "./DepartmentForm";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import the required CSS

const DepartmentView = () => {
  const { departments, isLoading, refetchDepartments } = useData(); // Access departments from context
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null); // To track selected department for editing
  const [isFormOpen, setIsFormOpen] = useState(false); // To toggle department form visibility
  const [formMode, setFormMode] = useState<"create" | "update">("create"); // To handle form mode (create or update)

  const handleDelete = (id: string) => {
    setDepartmentToDelete(id); // Store the department ID to be deleted
    setIsModalOpen(true); // Show the confirmation modal
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);

    try {
      await newRequest.delete(`/department/${departmentToDelete}`);
      refetchDepartments(); // Refetch departments immediately after deletion
      toast.success("Department deleted successfully"); // Show success notification
    } catch (error) {
      console.error("Error deleting department", error);
      toast.error("Failed to delete department. Please try again."); // Show error notification
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false); // Close the modal after confirming deletion
      setDepartmentToDelete(null); // Clear the department ID
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal without deleting
    setDepartmentToDelete(null); // Clear the department ID
  };

  const handleEdit = (department: any) => {
    setSelectedDepartment(department); // Set selected department to be edited
    setFormMode("update"); // Set the form mode to 'update'
    setIsFormOpen(true); // Open the form in update mode
  };

  const handleCreateNewDepartment = () => {
    setFormMode("create"); // Set the form mode to 'create'
    setIsFormOpen(true); // Open the form in create mode
  };

  const handleCloseForm = () => {
    setIsFormOpen(false); // Close the form when canceled
    setSelectedDepartment(null); // Clear the selected department
    refetchDepartments(); // Refetch the departments after closing the form
  };

  const handleCreateOrUpdateSuccess = () => {
    refetchDepartments(); // Refetch the departments after creation or update
    toast.success("Department created/updated successfully!"); // Show success notification
  };

  if (isLoading) {
    return <p>Loading departments...</p>;
  }

  return (
    <div className="space-y-4 mr-10 ml-5 ">
      <div className="flex justify-between mt-5">
      <h1 className="text-2xl font-semibold">Departments</h1>

{/* Button to open the Department Form in Create Mode */}
<Button
  onClick={handleCreateNewDepartment} // Open the form in create mode
  className="bg-primary mb-4 text-white hover:text-black hover:border-black hover:border-slate-700"
  variant="secondary"
>
  Create New Department
</Button>
      </div>

      <div className="space-y-2">
        {departments.map((department) => (
          <div key={department._id} className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">{department.name}</h3>
              <p className="text-sm text-gray-600">{department.description}</p>
            </div>
            <div className="space-x-3">
              <Button
                onClick={() => handleEdit(department)} // Open the form in update mode
                className="bg-primary"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(department._id)}
                className="bg-destructive "
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        departmentName={departmentToDelete ? departments.find(dept => dept._id === departmentToDelete)?.name || "" : ""}
      />

      {/* Department Form for Creating or Editing */}
      {isFormOpen && (
        <DepartmentForm
          mode={formMode} // Pass the form mode (create or update)
          initialData={selectedDepartment} // Pass the selected department to pre-populate the form
          onClose={handleCloseForm} // Close form when done
          onSuccess={handleCreateOrUpdateSuccess} // Refetch after creation or update
        />
      )}
    </div>
  );
};

export default DepartmentView;

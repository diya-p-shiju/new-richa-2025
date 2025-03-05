import { Button } from "@/components/ui/button";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useData } from "@/components/context/DataProvider";
import { useMutation } from "@tanstack/react-query";
import newRequest from "@/utils/newRequest";

type DepartmentFormProps = {
  mode: "create" | "update";
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
  };
  onClose: () => void;
};

const DepartmentForm: React.FC<DepartmentFormProps> = ({ mode, initialData, onClose }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || "",
      description: initialData?.description || "",
    });
  
    useEffect(() => {
      if (mode === "update" && initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      }
    }, [mode, initialData]);
  
    const createMutation = useMutation({
      mutationFn: (data: typeof formData) => {
        return newRequest.post("/department", data); // Create department API call
      },
      onSuccess: () => {
        console.log("Department created successfully!");
        onClose();
      },
      onError: (error) => {
        console.error("Error creating department", error);
      },
    });
  
    const updateMutation = useMutation({
      mutationFn: (data: typeof formData) => {
        return newRequest.put(`/department/${initialData?._id}`, data); // Update department API call
      },
      onSuccess: () => {
        console.log("Department updated successfully!");
        onClose();
      },
      onError: (error) => {
        console.error("Error updating department", error);
      },
    });
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (mode === "create") {
          if (!formData.name || formData.name.length < 3) {
            alert("Department name must be at least 3 characters long.");
            return;
          }
          createMutation.mutate(formData);
        } else {
          updateMutation.mutate(formData);
        }
      } catch (error) {
        console.error("Error in form submission", error);
      }
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <h1 className="text-xl font-semibold text-center mb-4">
            {mode === "create" ? "Create Department" : "Update Department"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Department Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
              required
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };
  
  export default DepartmentForm;
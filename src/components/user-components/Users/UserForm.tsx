import { Button } from "@/components/ui/button";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useData } from "@/components/context/DataProvider";
import { useMutation } from "@tanstack/react-query";
import newRequest from "@/utils/newRequest";

type UserFormProps = {
  mode: "create" | "update";
  initialData?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    password?: string;
  };
  onClose: () => void;
};

const UserForm: React.FC<UserFormProps> = ({ mode, initialData, onClose }) => {
  const { departments, refetchUsers } = useData();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "",
    department: initialData?.department || "",
    password: initialData?.password || "", 
  });

  const [errors, setErrors] = useState<any>({}); 

  useEffect(() => {
    if (mode === "update" && initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "",
        department: initialData.department || "",
        password: "",
      });
    }
  }, [mode, initialData]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return newRequest.post("/user", data);
    },
    onSuccess: () => {
      console.log("User created successfully!");
      refetchUsers(); 
      onClose();
    },
    onError: (error) => {
      console.error("Error creating user", error);
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return newRequest.put(`/user/${initialData?._id}`, data); // Update user API call
    },
    onSuccess: () => {
      console.log("User updated successfully!");
      refetchUsers(); 
      onClose();
    },
    onError: (error) => {
      console.error("Error updating user", error);
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // Basic validation for create mode
    if (mode === "create") {
      let isValid = true;
      const newErrors: any = {};

      // Check if password is provided and has at least 6 characters
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
      }

      // Check for missing fields (name, email, role, department)
      if (!formData.name) {
        newErrors.name = "Name is required";
        isValid = false;
      }
      if (!formData.email) {
        newErrors.email = "Email is required";
        isValid = false;
      }
      if (!formData.role) {
        newErrors.role = "Role is required";
        isValid = false;
      }
      if (!formData.department) {
        newErrors.department = "Department is required";
        isValid = false;
      }

      if (!isValid) {
        setErrors(newErrors);
        return; // Stop form submission if validation fails
      }
    }

    try {
      if (mode === "create") {
        createMutation.mutate(formData);  // Trigger create mutation
      } else {
        updateMutation.mutate(formData);  // Trigger update mutation
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
          {mode === "create" ? "Create User" : "Update User"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
              required={mode === "create"} // Make password required only for create
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
            >
              <option value="">Select Role</option>
              <option value="teaching-staff">Teaching Staff</option>
              <option value="non-teaching-staff">Non-Teaching Staff</option>
              <option value="hod">HOD</option>
              <option value="principal">Principal</option>
              <option value="director">Director</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <div>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
          </div>

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
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary hover:text-black"
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

export default UserForm;

import { useState } from "react";
import { useData } from "@/components/context/DataProvider";
import { Button } from "@/components/ui/button";
import UserForm from "./UserForm";
import newRequest from "@/utils/newRequest";
import DeleteConfirmation from "../Misc-Pages/DeleteConfirmation";

type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department: number;
};

const GetUsers = () => {
  const { users, departments, isLoading, error, refetchUsers } = useData();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept._id === departmentId);
    return department ? department.name : "Unknown Name";
  };

  const handleCreate = () => {
    setFormMode("create");
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleUpdate = (user: User) => {
    setFormMode("update");
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      await newRequest.delete(`/user/${userToDelete}`);
      alert("User deleted successfully");
      refetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <main className="table max-h-[600px]">
      <div className="table__header">
        <h1 className="font-bold text-xl">Users List</h1>
        {/* <div className="input-group">
          <input type="text" placeholder="Search..." />
        </div> */}
        <Button onClick={handleCreate}>Create New User</Button>
      </div>

      <div className="rounded-md border overflow-x-auto overflow-y-auto max-h-[500px] table_body">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Password</th>
              <th>Department</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{"*".repeat(user.password.length)}</td>
                <td>{getDepartmentName(user.department)}</td>
                <td>
                  <Button onClick={() => handleUpdate(user)}>Update</Button>
                  <Button
                    variant="secondary"
                    disabled={isDeleting}
                    onClick={() => handleDelete(user._id)}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm
          mode={formMode}
          initialData={formMode === "update" ? selectedUser : undefined}
          onClose={handleCloseForm}
        />
      )}

      <DeleteConfirmation
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        departmentName={userToDelete ? users.find((user) => user._id === userToDelete)?.name || "" : ""}
      />
    </main>
  );
};

export default GetUsers;

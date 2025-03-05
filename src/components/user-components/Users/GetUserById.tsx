import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "@/utils/newRequest"; // Assuming this is a utility to make API requests

const GetUserById = () => {
  const { id } = useParams(); // Get the user ID from the URL

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", id], // queryKey should be an array
    queryFn: () => newRequest.get(`/users/${id}`).then((res) => res.data), // queryFn to fetch data
    enabled: !!id, // Ensures query only runs when `id` is available
  });

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (isError) {
    return <div>Error fetching user data: {error?.message}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          User Details
        </h2>

        <div className="space-y-4">
          <div>
            <strong className="text-gray-600">Name:</strong>
            <p className="text-gray-700">{data?.name}</p>
          </div>
          <div>
            <strong className="text-gray-600">Email:</strong>
            <p className="text-gray-700">{data?.email}</p>
          </div>
          <div>
            <strong className="text-gray-600">Role:</strong>
            <p className="text-gray-700">{data?.role}</p>
          </div>
          <div>
            <strong className="text-gray-600">Department:</strong>
            <p className="text-gray-700">{data?.department}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()} // Go back to previous page
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetUserById;

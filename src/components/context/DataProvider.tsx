import { createContext, useContext } from "react";
import newRequest from "@/utils/newRequest";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

// User type that is going to be cached
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department : number;
}

// Department type that is going to be cached as well
interface Department {
  _id: string;
  name: string;
  description: string;
}

// For creating a context of data
interface DataContextType {
  users: User[];
  departments: Department[];
  isLoading: boolean;
  refetchUsers: () => void;
  refetchDepartments: () => void;
  error: string | null;
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  users: [],
  departments: [],
  isLoading: true,
  refetchUsers: () => {},
  refetchDepartments: () => {},
  error: null,
});

// Initialize the QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Fetch functions
const fetchUsers = async (): Promise<User[]> => {
  try {
    const success = await newRequest.get("user");
    return success.data;
  } catch (error) {
    console.log("Error while fetching initial user cache data", error);
    throw error;
  }
};

const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const success = await newRequest.get("department");
    console.log(success.data);
    return success.data;
  } catch (error) {
    console.log(
      "Error while caching the department details in the start",
      error
    );
    throw error;
  }
};

// Context provider component, triggers the fetch functions, gets the data, and saves it as a context via DataContext.Provider
export const DataContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: users,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const {
    data: departments,
    isLoading: departmentsLoading,
    isFetching: departmentsFetching,
    error: departmentsError,
    refetch: refetchDepartments,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: fetchDepartments, 
  });

  const isLoading =
    usersLoading || departmentsLoading || usersFetching || departmentsFetching;
  const error =
    usersError || departmentsError
      ? "Error occurred while fetching data"
      : null;

  return (
    <DataContext.Provider
      value={{
        users: users || [],
        departments: departments || [],
        isLoading,
        refetchUsers,
        refetchDepartments,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for accessing context
export const useData = () => {
  return useContext(DataContext);
};

// AppWrapper component that provides React Query and context to your app
interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataContextProvider>
      <ToastContainer />{children}</DataContextProvider>
    </QueryClientProvider>
  );
};

import React from 'react';
import { Navigate } from 'react-router-dom';

const NavigatePage = () => {
  const currentUser = localStorage.getItem("role");
  const [redirect, setRedirect] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRedirect(true);
    }, 3000); // Redirect after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (redirect) {
    switch (currentUser) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "hod":
      case "principal":
      case "non-teaching-staff":
      case "teaching-staff":
        return <Navigate to="/user" replace />;
      default:
        return <Navigate to="/login" replace />; // Fallback for unknown roles
    }
  }

  return <div>Loading...</div>;
};

export default NavigatePage;
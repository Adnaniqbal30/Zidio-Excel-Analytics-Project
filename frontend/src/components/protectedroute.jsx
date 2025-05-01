import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // If no specific roles are required, allow access
    if (allowedRoles.length === 0) {
      return children;
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(userRole)) {
      return children;
    }

    // If role is not allowed, redirect to home
    return <Navigate to="/" replace />;
  } catch (error) {
    console.error('Token validation failed:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

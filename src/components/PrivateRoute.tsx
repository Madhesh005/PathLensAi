// filepath: d:\Madhesh\Projects\PathLens Ai\lovable_code\pathlens-career-compass-ai-main\vite-project\src\components\PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
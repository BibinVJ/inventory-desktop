import { useAuth } from '../hooks/useAuth';
import AppRouter from '../router';

const AuthWrapper = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AppRouter isAuthenticated={isAuthenticated} />;
};

export default AuthWrapper;

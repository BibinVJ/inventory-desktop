// src/router/index.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router';
import AddSale from '../pages/Sales/AddSale';
import SignIn from '../pages/AuthPages/SignIn';

interface AppRouterProps {
  isAuthenticated: boolean;
}

const AppRouter = ({ isAuthenticated }: AppRouterProps) => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <SignIn /> : <Navigate to="/add-sale" />}
        />
        <Route
          path="/add-sale"
          element={isAuthenticated ? <AddSale /> : <Navigate to="/login" />}
        />
        <Route
          path="/*"
          element={<Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;

// src/router/index.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router';
import AddSale from '../pages/Sales/AddSale';
import SignIn from '../pages/AuthPages/SignIn';
import Sales from '../pages/Sales/Sales';
import AppLayout from '../layout/AppLayout';

interface AppRouterProps {
  isAuthenticated: boolean;
}

const AppRouter = ({ isAuthenticated }: AppRouterProps) => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <SignIn /> : <Navigate to="/add-sale" />} />
        {isAuthenticated ? (
          <Route path="/*" element={<AppLayout />}>
            <Route path="add-sale" element={<AddSale />} />
            <Route path="sales" element={<Sales />} />
            <Route path="*" element={<Navigate to="/add-sale" />} />
          </Route>
        ) : (
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;

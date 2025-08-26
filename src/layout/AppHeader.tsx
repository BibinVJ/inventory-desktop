import { Link, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full px-6 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-l font-bold text-gray-800 dark:text-white">Inventory Manager</h1>
          
          <nav className="flex items-center gap-4">
            {hasPermission('create-sale') && (
              <Link
                to="/add-sale"
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/add-sale')
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Add Sale
              </Link>
            )}
            {hasPermission('view-sale') && (
              <Link
                to="/sales"
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/sales')
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Sales
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
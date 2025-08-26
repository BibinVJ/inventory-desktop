import { Outlet } from "react-router";
import AppHeader from "./AppHeader";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <div className="min-h-screen xl:flex"> */}

      <AppHeader />
      {/* <div className="flex-1 p-4 mx-auto w-full max-w-7xl md:p-6"> */}
      <div className="p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6">

        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
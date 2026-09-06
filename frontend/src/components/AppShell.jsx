import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));

const PageFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-gray-50">
    <p className="text-sm text-gray-500">Loading...</p>
  </div>
);

const AppShell = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/dashboard";

  return (
    <>
      <div hidden={!isHome} inert={!isHome || undefined}>
        <Suspense fallback={<PageFallback />}>
          <Dashboard />
        </Suspense>
      </div>

      {!isHome && (
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      )}
    </>
  );
};

export default AppShell;

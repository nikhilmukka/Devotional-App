import { Outlet, useLocation } from "react-router";
import { MobileFrame } from "../components/MobileFrame";

export function RootLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <MobileFrame>
      <Outlet />
    </MobileFrame>
  );
}

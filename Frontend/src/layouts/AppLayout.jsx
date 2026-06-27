import { Outlet } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

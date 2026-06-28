import GovNavbar from "../components/GovNavbar";
import { Outlet } from "react-router-dom";

export default function GovLayout() {
  return (
    <div className="w-full min-h-screen bg-x-bg text-x-text">
      <GovNavbar />

      <main className="w-full max-w-5xl mx-auto my-20 px-4">
        <Outlet />
      </main>
    </div>
  );
}

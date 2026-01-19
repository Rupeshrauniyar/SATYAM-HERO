import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="w-full max-w-xl mx-auto my-16 px-2">
        <Outlet />
      </main>
    </div>
  );
}

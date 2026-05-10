import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl px-4 py-6 mx-auto text-sm text-center text-gray-500">
          KAU Restaurant
        </div>
      </footer>
    </div>
  );
}

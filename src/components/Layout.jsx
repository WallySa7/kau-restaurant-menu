import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="animate-page-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

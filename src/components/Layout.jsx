import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

function useExitTransition() {
  useEffect(() => {
    const handler = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel')
      ) return;
      const root = document.getElementById('root');
      if (!root || root.style.opacity === '0') return;
      root.style.transition = 'opacity 130ms ease-in';
      root.style.opacity = '0';
      setTimeout(() => {
        root.style.transition = 'opacity 200ms ease-out';
        root.style.opacity = '1';
      }, 260);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);
}

export default function Layout() {
  const location = useLocation();
  useExitTransition();
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

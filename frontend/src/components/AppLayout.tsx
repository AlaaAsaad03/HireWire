import { useState } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content area */}
      <main
        className={`transition-[margin-left] duration-200 ease-in-out min-h-screen ${
          collapsed ? "md:ml-[60px]" : "md:ml-[240px]"
        }`}
      >
        <div className="page-frame">
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import LogsPanel from '@/components/LogsPanel';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

const LogsPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto">
            <LogsPanel />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default function LogsPageWithProtection() {
  return (
    <ProtectedRoute>
      <LogsPage />
    </ProtectedRoute>
  );
}

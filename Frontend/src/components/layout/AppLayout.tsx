import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthStore } from '../../lib/auth';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-[#0b0c0d] flex flex-col">
      <Navbar />
      {/* Add top padding to offset fixed navbar (h-16 = 64px), bottom padding above footer, and responsive horizontal padding */}
      <main className="flex-1 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

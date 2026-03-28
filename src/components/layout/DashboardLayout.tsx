import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GuidedTour, TourTrigger, DEFAULT_TOUR_STEPS } from '../tour/GuidedTour';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isTourRunning, setIsTourRunning] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {

        const timer = setTimeout(() => setIsTourRunning(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleTourComplete = () => {
    setIsTourRunning(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleTourSkip = () => {
    setIsTourRunning(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleTourStart = () => {
    setIsTourRunning(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <GuidedTour
        steps={DEFAULT_TOUR_STEPS}
        isRunning={isTourRunning}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      <TourTrigger onStart={handleTourStart} />
    </div>
  );
};
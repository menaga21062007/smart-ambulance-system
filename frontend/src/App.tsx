import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AmbulanceDashboard } from './pages/AmbulanceDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { TrafficDashboard } from './pages/TrafficDashboard';
import { WardDashboard } from './pages/WardDashboard';
import { AdmissionDischargeView } from './pages/AdmissionDischargeView';
import { DoctorView } from './pages/DoctorView';
import { CleaningView } from './pages/CleaningView';
import { ResourceManagement } from './pages/ResourceManagement';
import { NotificationCenterView } from './pages/NotificationCenterView';
import { ReportsView } from './pages/ReportsView';

const MainAppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<string>('landing');

  if (activeView === 'landing') {
    return <LandingPage onNavigate={(view) => setActiveView(view)} />;
  }

  if (activeView === 'login') {
    return <LoginPage onLoginSuccess={() => setActiveView('dashboard')} />;
  }

  const renderActiveTabContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'ambulance':
        return <AmbulanceDashboard />;
      case 'hospital':
        return <HospitalDashboard />;
      case 'traffic':
        return <TrafficDashboard />;
      case 'wards':
        return <WardDashboard />;
      case 'admissions':
        return <AdmissionDischargeView />;
      case 'doctor':
        return <DoctorView />;
      case 'cleaning':
        return <CleaningView />;
      case 'resources':
        return <ResourceManagement />;
      case 'notifications':
        return <NotificationCenterView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans transition-colors bg-cover bg-center bg-fixed" style={{
      backgroundImage: `radial-gradient(circle at top center, rgba(11, 15, 25, 0.85), rgba(11, 15, 25, 0.96)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000')`
    }}>
      <Header
        activeTab={activeView}
        setActiveTab={(tab) => setActiveView(tab)}
        onNavigateHome={() => setActiveView('landing')}
        onLogout={() => {
          logout();
          setActiveView('login');
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto relative z-10">
        <Sidebar
          activeTab={activeView}
          setActiveTab={(tab) => setActiveView(tab)}
          onLogout={() => {
            logout();
            setActiveView('login');
          }}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          <Breadcrumbs activeTab={activeView} onNavigateHome={() => setActiveView('landing')} />
          {renderActiveTabContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainAppLayout />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

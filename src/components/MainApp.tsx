
import React, { useState } from 'react';
import { Heart, Users, BookOpen, User, LogOut, Car } from 'lucide-react';
import EnhancedChildrenSection from './EnhancedChildrenSection';
import EnhancedRobinManagement from './EnhancedRobinManagement';
import EducationSection from './EducationSection';
import EnhancedDriveManagement from './EnhancedDriveManagement';
import AuthSection from './AuthSection';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/hooks/useAuth';

type ActiveSection = 'children' | 'robins' | 'education' | 'drives';

const MainAppContent = () => {
  const { user, signOut, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('children');

  const handleLogin = () => {
    setActiveSection('children');
  };

  const handleLogout = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'children':
        return <EnhancedChildrenSection />;
      case 'robins':
        return <EnhancedRobinManagement />;
      case 'education':
        return <EducationSection />;
      case 'drives':
        return <EnhancedDriveManagement />;
      default:
        return <EnhancedChildrenSection />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthSection onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Robinhood Army</h1>
                <p className="text-sm text-gray-500">Compassion in Action</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'children', label: 'Children', icon: Users },
              { id: 'robins', label: 'Robins', icon: User },
              { id: 'drives', label: 'Drives', icon: Car },
              { id: 'education', label: 'Education', icon: BookOpen },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as ActiveSection)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

const MainApp = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default MainApp;

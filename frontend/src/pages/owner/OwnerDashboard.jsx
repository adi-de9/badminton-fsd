import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Star, LogOut, TrendingUp, Users } from 'lucide-react';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  
  // Mock data for now since we don't have owner-specific endpoints yet
  const stats = {
    totalStores: 1,
    avgRating: 4.8,
    totalBookings: 124,
    revenue: 45000
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-lg font-bold">Owner Dashboard</h1>
              <p className="text-xs text-slate-500">Manage your centers</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-slate-600">
               {user?.name}
             </span>
             <button
               onClick={logout}
               className="flex items-center gap-2 text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span className="text-sm font-medium">Logout</span>
             </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="My Stores" 
            value={stats.totalStores} 
            icon={Store} 
            color="indigo" 
          />
          <Card 
            title="Total Revenue" 
            value={`₹${stats.revenue}`} 
            icon={TrendingUp} 
            color="emerald" 
          />
          <Card 
            title="Total Bookings" 
            value={stats.totalBookings} 
            icon={Users} 
            color="blue" 
          />
          <Card 
            title="Avg Rating" 
            value={stats.avgRating} 
            icon={Star} 
            color="yellow" 
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
          <h3 className="text-lg font-medium text-slate-800 mb-2">My Centers</h3>
          <p className="mb-4">You have 1 center listed.</p>
          <div className="p-4 border rounded-xl inline-block text-left bg-slate-50">
             <div className="font-bold text-slate-800">Badminton Pro Standard</div>
             <div className="text-sm text-slate-500">London, UK</div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default OwnerDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../api/bookings';
import { Calendar, Clock, MapPin, Search, PlusCircle, User, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getUserBookings(user._id);
        setBookings(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              SP
            </div>
            <h1 className="font-bold text-lg text-slate-800">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-slate-600">{user?.name}</span>
             <button onClick={logout} className="text-sm text-red-500 hover:text-red-600">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-slate-500 mt-1">Here is the history of your court bookings.</p>
          </div>
          <Link 
            to="/book" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            <PlusCircle className="w-5 h-5" /> Book a Court
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 <Calendar className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-medium">Total Bookings</p>
                 <h3 className="text-2xl font-bold text-slate-900">{bookings.length}</h3>
              </div>
           </div>
           {/* Add more stats if available */}
        </div>

        {/* Bookings List */}
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Bookings</h3>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Calendar className="w-8 h-8" />
             </div>
             <h4 className="text-lg font-bold text-slate-700">No bookings yet</h4>
             <p className="text-slate-400 mb-6">You haven't booked any courts yet.</p>
             <Link to="/book" className="text-indigo-600 font-bold hover:underline">Book your first court</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    <div className="flex items-start gap-4">
                       <div className="w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-700 border border-indigo-100">
                          <span className="text-xs font-bold uppercase">{new Date(booking.startTime).toLocaleDateString('en-US',{month:'short'})}</span>
                          <span className="text-xl font-black">{new Date(booking.startTime).getDate()}</span>
                       </div>
                       
                       <div>
                          <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                             {booking.courtId?.name || 'Unknown Court'}
                             <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                               booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                               booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                               {booking.status}
                             </span>
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                             <span className="flex items-center gap-1">
                               <Clock className="w-4 h-4" /> 
                               {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                             </span>
                             {booking.coachId && (
                               <span className="flex items-center gap-1">
                                 <User className="w-4 h-4" /> Coach: {booking.coachId.name}
                               </span>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="text-right">
                       <div className="text-2xl font-bold text-slate-900">₹{booking.totalPrice}</div>
                       <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Paid</div>
                    </div>

                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;

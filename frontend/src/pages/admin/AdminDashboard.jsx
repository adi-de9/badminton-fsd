import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, LogOut, LayoutGrid, Briefcase, User, DollarSign, List, Trash2, Zap, MapPin } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Toast from '../../components/common/Toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('COURTS');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // State for admin resources
  const [courts, setCourts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [courtsRes, coachesRes, equipRes, rulesRes] = await Promise.all([
        adminAPI.getCourts(),
        adminAPI.getCoaches(),
        adminAPI.getEquipment(),
        adminAPI.getPricingRules()
      ]);

      setCourts(courtsRes.data || []);
      setCoaches(coachesRes.data || []);
      setEquipment(equipRes.data || []);
      setPricingRules(rulesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setNotification({ msg: error.message, type: 'error' });
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'COURTS', label: 'Courts', icon: LayoutGrid },
    { id: 'INVENTORY', label: 'Inventory', icon: Briefcase },
    { id: 'STAFF', label: 'Staff', icon: User },
    { id: 'RULES', label: 'Pricing Rules', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">SmashPoint Management</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[700px] flex flex-col md:flex-row">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
              Management
            </h3>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-white hover:text-indigo-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto max-h-[800px]">
            <div className="max-w-4xl mx-auto">
              {activeTab === 'COURTS' && (
                <CourtsManager 
                  courts={courts} 
                  setCourts={setCourts}
                  setNotification={setNotification}
                />
              )}
              {activeTab === 'INVENTORY' && (
                <EquipmentManager 
                  equipment={equipment} 
                  setEquipment={setEquipment}
                  setNotification={setNotification}
                />
              )}
              {activeTab === 'STAFF' && (
                <CoachesManager 
                  coaches={coaches} 
                  setCoaches={setCoaches}
                  setNotification={setNotification}
                />
              )}
              {activeTab === 'RULES' && (
                <RulesManager 
                  rules={pricingRules} 
                  setRules={setPricingRules}
                  setNotification={setNotification}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Courts Manager Component
const CourtsManager = ({ courts, setCourts, setNotification }) => {
  const [newCourt, setNewCourt] = useState({ name: '', type: 'indoor', basePricePerHour: 800 });
  const [creating, setCreating] = useState(false);

  const handleAdd = async () => {
    if (!newCourt.name) return;
    setCreating(true);
    try {
      const result = await adminAPI.createCourt(newCourt);
      setCourts([...courts, result.data]);
      setNewCourt({ name: '', type: 'indoor', basePricePerHour: 800 });
      setNotification({ msg: 'Court added successfully!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
    setCreating(false);
  };

  const handleToggleStatus = async (court) => {
    try {
      const result = await adminAPI.updateCourt(court._id, { 
        isActive: !court.isActive 
      });
      setCourts(courts.map((c) => c._id === court._id ? result.data : c));
      setNotification({ msg: 'Court updated!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  const handleDelete = async (courtId) => {
    if (!window.confirm('Delete this court?')) return;
    try {
      await adminAPI.deleteCourt(courtId);
      setCourts(courts.filter((c) => c._id !== courtId));
      setNotification({ msg: 'Court deleted!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Courts Management</h2>
        <p className="text-slate-500 text-sm mt-1">Manage availability and base rates.</p>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase">New Court Name</label>
          <input
            className="w-full p-2 mt-1 rounded-lg border-slate-300 focus:ring-indigo-500"
            value={newCourt.name}
            onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
            placeholder="e.g. Center Court"
          />
        </div>
        <div className="w-32">
          <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
          <select
            className="w-full p-2 mt-1 rounded-lg border-slate-300"
            value={newCourt.type}
            onChange={(e) => setNewCourt({ ...newCourt, type: e.target.value })}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>
        <div className="w-24">
          <label className="text-xs font-bold text-slate-500 uppercase">Rate</label>
          <input
            type="number"
            className="w-full p-2 mt-1 rounded-lg border-slate-300"
            value={newCourt.basePricePerHour}
            onChange={(e) => setNewCourt({ ...newCourt, basePricePerHour: +e.target.value })}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50"
        >
          {creating ? 'Adding...' : 'Add'}
        </button>
      </div>

      <div className="grid gap-4">
        {courts.map((c) => (
          <div
            key={c._id}
            className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  c.type === 'indoor' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {c.type === 'indoor' ? <Zap className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{c.name}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                    ₹{c.basePricePerHour}/hr
                  </span>
                  <span>•</span>
                  <span className="capitalize">{c.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleStatus(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  !c.isActive ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {c.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Equipment Manager Component
const EquipmentManager = ({ equipment, setEquipment, setNotification }) => {
  const [newItem, setNewItem] = useState({ name: '', pricePerSession: 0, totalStock: 10 });
  const [creating, setCreating] = useState(false);

  const handleAdd = async () => {
    if (!newItem.name) return;
    setCreating(true);
    try {
      const result = await adminAPI.createEquipment(newItem);
      setEquipment([...equipment, result.data]);
      setNewItem({ name: '', pricePerSession: 0, totalStock: 10 });
      setNotification({ msg: 'Equipment added!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await adminAPI.deleteEquipment(id);
      setEquipment(equipment.filter((e) => e._id !== id));
      setNotification({ msg: 'Equipment deleted!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
      
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex gap-4 items-end">
        <input
          className="flex-1 p-2 rounded-lg border-slate-300"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          className="w-24 p-2 rounded-lg border-slate-300"
          type="number"
          placeholder="Price"
          value={newItem.pricePerSession}
          onChange={(e) => setNewItem({ ...newItem, pricePerSession: +e.target.value })}
        />
        <input
          className="w-24 p-2 rounded-lg border-slate-300"
          type="number"
          placeholder="Stock"
          value={newItem.totalStock}
          onChange={(e) => setNewItem({ ...newItem, totalStock: +e.target.value })}
        />
        <button
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold disabled:opacity-50"
          onClick={handleAdd}
          disabled={creating}
        >
          {creating ? 'Adding...' : 'Add'}
        </button>
      </div>
      
      <div className="space-y-2">
        {equipment.map((e) => (
          <div
            key={e._id}
            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
          >
            <span className="font-bold text-slate-700">{e.name}</span>
            <div className="flex gap-4 text-sm text-slate-500">
              <span>₹{e.pricePerSession}/unit</span>
              <span>{e.totalStock} in stock</span>
              <button
                onClick={() => handleDelete(e._id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Coaches Manager Component
const CoachesManager = ({ coaches, setCoaches, setNotification }) => {
  const [newCoach, setNewCoach] = useState({ name: '', hourlyRate: 400 });
  const [creating, setCreating] = useState(false);

  const handleAdd = async () => {
    if (!newCoach.name) return;
    setCreating(true);
    try {
      const result = await adminAPI.createCoach(newCoach);
      setCoaches([...coaches, result.data]);
      setNewCoach({ name: '', hourlyRate: 400 });
      setNotification({ msg: 'Coach added!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coach?')) return;
    try {
      await adminAPI.deleteCoach(id);
      setCoaches(coaches.filter((c) => c._id !== id));
      setNotification({ msg: 'Coach deleted!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Staff</h2>
      
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex gap-4 items-end">
        <input
          className="flex-1 p-2 rounded-lg border-slate-300"
          placeholder="Coach Name"
          value={newCoach.name}
          onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })}
        />
        <input
          className="w-24 p-2 rounded-lg border-slate-300"
          type="number"
          placeholder="Rate"
          value={newCoach.hourlyRate}
          onChange={(e) => setNewCoach({ ...newCoach, hourlyRate: +e.target.value })}
        />
        <button
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold disabled:opacity-50"
          onClick={handleAdd}
          disabled={creating}
        >
          {creating ? 'Adding...' : 'Add'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {coaches.map((c) => (
          <div
            key={c._id}
            className="flex items-center p-4 bg-white border border-slate-200 rounded-xl gap-4"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
              {c.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-slate-500">₹{c.hourlyRate}/hr</div>
            </div>
            <button
              onClick={() => handleDelete(c._id)}
              className="text-red-400 hover:bg-red-50 p-2 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Rules Manager Component
const RulesManager = ({ rules, setRules, setNotification }) => {
  const toggleRule = async (rule) => {
    try {
      const result = await adminAPI.updatePricingRule(rule._id, { 
        isActive: !rule.isActive 
      });
      setRules(rules.map((r) => r._id === rule._id ? result.data : r));
      setNotification({ msg: 'Rule updated!', type: 'success' });
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Pricing Engine</h2>
      <div className="grid gap-4">
        {rules.map((r) => (
          <div
            key={r._id}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm"
          >
            <div>
              <div className="font-bold text-slate-800">{r.name}</div>
              <div className="text-xs font-mono text-slate-500 mt-1">
                {JSON.stringify(r.condition)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-bold ${
                  r.type === 'multiplier' ? 'text-purple-600' : 'text-blue-600'
                }`}
              >
                {r.type === 'multiplier' ? `${r.value}x` : `+₹${r.value}`}
              </span>
              <button
                onClick={() => toggleRule(r)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  r.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    r.isActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

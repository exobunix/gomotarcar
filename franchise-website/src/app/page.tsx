"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// ----------------------------------------------------
// Core API Config & State Management (simulating Redux)
// ----------------------------------------------------
const API_BASE = "https://gomotarcar-api.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Configure token on request
if (typeof window !== "undefined") {
  const token = localStorage.getItem("franchise_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export default function FranchisePortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "staff" | "profile">("dashboard");

  // Auth/Register Toggle
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Auth form state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    franchiseName: "",
    type: "cleaning_station", // CSP / Steam Car Wash
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
  });

  // Data states
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    activeBookings: 0,
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([
    { _id: "1", firstName: "Rajesh", lastName: "Kumar", role: "Mechanic", phone: "+91-9876543210", isActive: true },
    { _id: "2", firstName: "Suresh", lastName: "Patel", role: "Electrician", phone: "+91-9876543211", isActive: true },
    { _id: "3", firstName: "Amit", lastName: "Singh", role: "Detailer", phone: "+91-9876543212", isActive: false },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New staff form state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  // Check auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("franchise_token");
    const storedUser = localStorage.getItem("franchise_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchBookingsData();
      fetchStaffData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/franchise");
      if (response.data?.data) {
        const d = response.data.data;
        setStats({
          todayBookings: d.bookings?.today || d.stats?.todayBookings || 0,
          totalBookings: d.bookings?.total || d.stats?.totalBookings || 0,
          pendingBookings: d.bookings?.active || d.stats?.pendingBookings || 0,
          completedBookings: d.bookings?.completed || d.stats?.completedBookings || 0,
          activeBookings: d.bookings?.active || 0,
        });
        if (d.profile) {
          setProfile(d.profile);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookingsData = async () => {
    try {
      const response = await api.get("/bookings", { params: { limit: 50 } });
      if (response.data?.data) {
        setBookings(response.data.data.items || response.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaffData = async () => {
    try {
      const response = await api.get("/cleaner", { params: { limit: 50 } });
      if (response.data?.data) {
        const items = response.data.data.items || response.data.data || [];
        if (items.length > 0) {
          setStaffList(items);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchBookingsData(), fetchStaffData()]);
    setRefreshing(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setAuthError("Please fill in both fields");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const data = res.data?.data || res.data;
      if (data.tokens?.accessToken) {
        const accessToken = data.tokens.accessToken;
        const loggedUser = data.user;
        if (loggedUser.role !== "franchise" && loggedUser.role !== "super_admin") {
          setAuthError("Unauthorized: Only Franchise Partners can log in here.");
          setAuthLoading(false);
          return;
        }
        localStorage.setItem("franchise_token", accessToken);
        localStorage.setItem("franchise_user", JSON.stringify(loggedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        setToken(accessToken);
        setUser(loggedUser);
        setIsAuthenticated(true);
      } else {
        setAuthError("Invalid credentials or role");
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.response?.data?.error?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await api.post("/auth/register-franchise", {
        ...regForm,
        agreement: { commissionPercent: 15 },
      });
      alert("Registration Successful! Please sign in using your phone and password.");
      setIsRegisterMode(false);
      setPhone(regForm.phone);
      setPassword(regForm.password);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.response?.data?.error?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("franchise_token");
    localStorage.removeItem("franchise_user");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      await fetchBookingsData();
      await fetchDashboardData();
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/cleaner", {
        ...newStaff,
        employmentType: "full-time",
      });
      setShowAddStaffModal(false);
      setNewStaff({ firstName: "", lastName: "", phone: "", email: "", password: "" });
      fetchStaffData();
      alert("Staff created successfully!");
    } catch (err: any) {
      alert("Failed to create staff: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6 py-12 lg:px-8 overflow-y-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 my-8">
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="GoMotarCar" className="h-16 w-auto mb-4 object-contain" />
            <h2 className="text-center text-2xl font-extrabold tracking-tight text-white">
              Franchise Portal
            </h2>
            <p className="mt-1 text-center text-xs text-slate-400">
              "Anything & Everything for Your Car"
            </p>
          </div>

          {authError && (
            <div className="mt-6 rounded-lg bg-red-950/50 p-3 border border-red-500/30 text-center text-sm text-red-400">
              {authError}
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+919710000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Owner's Name (lowercase) + @123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="group relative flex w-full justify-center rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? "Logging in..." : "Sign In"}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Don't have an account? Register as Franchise Partner
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form className="mt-8 space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Franchise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="GoMotarCar Station"
                    value={regForm.franchiseName}
                    onChange={(e) => setRegForm({ ...regForm, franchiseName: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Franchise Type</label>
                  <select
                    value={regForm.type}
                    onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cleaning_station">CSP (Car Service Point)</option>
                    <option value="steam_car_wash">Steam Car Wash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Owner Full Name"
                    value={regForm.ownerName}
                    onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+919876543210"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@email.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Create Password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop address, Sector/Street name"
                    value={regForm.address}
                    onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Gurgaon"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Haryana"
                    value={regForm.state}
                    onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="122001"
                    value={regForm.pincode}
                    onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
                    className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-650 text-white rounded-xl font-semibold cursor-pointer transition-all text-sm"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold cursor-pointer transition-all text-sm disabled:opacity-50"
                >
                  {authLoading ? "Registering..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-slate-950 border-r border-slate-800">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <span className="text-3xl">🚗</span>
          <div>
            <h1 className="font-bold text-white tracking-wide">GoMotarCar</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Franchise Partner</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📅</span> Bookings
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "staff"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>👥</span> Staff List
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>👤</span> Profile Info
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-2xl">🚗</span>
            <h1 className="font-bold text-white text-lg">GoMotarCar Franchise</h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="Refresh Data"
            >
              🔄
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                {profile?.name?.charAt(0) || "F"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">
                  {profile?.name || "Partner"}
                </p>
                <p className="text-xs text-slate-400">
                  {profile?.type?.replace("_", " ") || "Service Station"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Mobile Tab bar */}
        <div className="md:hidden flex bg-slate-950 border-b border-slate-800">
          {(["dashboard", "bookings", "staff", "profile"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all ${
                activeTab === t ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {refreshing && (
            <div className="text-center py-2 text-xs text-blue-400 animate-pulse">
              Syncing live data...
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Today's Jobs</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{stats.todayBookings}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Active Cleanings</p>
                  <p className="text-3xl font-extrabold text-blue-400 mt-2">{stats.activeBookings}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Completed Jobs</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.completedBookings}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Bookings</p>
                  <p className="text-3xl font-extrabold text-purple-400 mt-2">{stats.totalBookings}</p>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-md font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                    <span className="text-xs font-medium text-slate-300 mt-2">Manage Bookings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("staff")}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                    <span className="text-xs font-medium text-slate-300 mt-2">Add Staff</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">💼</span>
                    <span className="text-xs font-medium text-slate-300 mt-2">Business Settings</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🔄</span>
                    <span className="text-xs font-medium text-slate-300 mt-2">Sync Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
                <h3 className="text-md font-bold text-white">Live Bookings Queue</h3>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-semibold">
                  {bookings.length} found
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Vehicle / Customer</th>
                      <th className="py-4 px-6">Date & Slot</th>
                      <th className="py-4 px-6">Service Name</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 text-sm">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-700/20 transition-all">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white">{b.vehicleNumber || "N/A"}</p>
                          <p className="text-xs text-slate-400">{b.customerName || "Customer"}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white">{b.slotDate ? new Date(b.slotDate).toLocaleDateString() : "N/A"}</p>
                          <p className="text-xs text-slate-400">{b.slotTime || "Standard slot"}</p>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-medium">
                          {b.serviceName || "Premium Wash"}
                        </td>
                        <td className="py-4 px-6 text-emerald-400 font-bold">
                          ₹{b.totalAmount || 0}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            b.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : b.status === "cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : b.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {b.status || "pending"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {b.status !== "completed" && b.status !== "cancelled" && (
                            <div className="flex items-center justify-end gap-2">
                              {b.status !== "in_progress" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b._id, "in_progress")}
                                  disabled={actionLoading === b._id}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                                >
                                  Start Job
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, "completed")}
                                disabled={actionLoading === b._id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                              >
                                Complete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500">
                          No active bookings or services scheduled.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Staff Management</h3>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>➕</span> Add Staff
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffList.map((item) => (
                  <div key={item._id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-lg">
                      {(item.firstName || item.name || "S").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate">
                        {item.firstName ? `${item.firstName} ${item.lastName || ""}` : item.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.role || "Cleaner / Executive"}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.phone || "No phone"}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      item.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-md text-center">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-3xl mx-auto mb-4">
                  {profile?.name?.charAt(0) || "F"}
                </div>
                <h3 className="text-xl font-bold text-white">{profile?.name || "GoMotarCar Service Center"}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                  {profile?.type?.replace("_", " ") || "Authorized Station"}
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-md space-y-4">
                <h4 className="text-md font-bold text-white pb-2 border-b border-slate-700/50">Business Details</h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-slate-400">Owner / Manager</div>
                  <div className="text-white text-right font-medium">{profile?.owner || "Partner Name"}</div>

                  <div className="text-slate-400">Registered Phone</div>
                  <div className="text-white text-right font-medium">{user?.phone || "+91-9876543210"}</div>

                  <div className="text-slate-400">Email Address</div>
                  <div className="text-white text-right font-medium truncate">{user?.email || "partner@gomotarcar.com"}</div>

                  <div className="text-slate-400">Commission Rate</div>
                  <div className="text-white text-right font-medium text-emerald-400">
                    {profile?.commission || 15}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-650 text-white rounded-xl font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold cursor-pointer transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

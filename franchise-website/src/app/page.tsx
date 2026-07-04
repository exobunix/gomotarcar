"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// ----------------------------------------------------
// Core API Config & State Management (simulating Redux)
// ----------------------------------------------------
const API_BASE = typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127.0.0.1")
  ? "https://gomotarcar-api.onrender.com/api/v1"
  : "http://localhost:5000/api/v1";

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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
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
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

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
      let formattedPhone = regForm.phone.trim();
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = "+91" + formattedPhone;
      }
      const payload = {
        franchiseName: regForm.franchiseName,
        ownerName: regForm.ownerName,
        phone: formattedPhone,
        email: regForm.email || undefined,
        password: regForm.password,
        type: "cleaning_station", // Must match Joi validator enum: 'workshop', 'service_center', 'cleaning_station'
        address: {
          street: regForm.address,
          city: regForm.city,
          state: regForm.state,
          pincode: regForm.pincode,
        },
        agreement: { commissionPercent: 15 },
      };
      await api.post("/auth/register-franchise", payload);
      alert("Registration Successful! Please wait for Admin approval to login.");
      setIsRegisterMode(false);
      setPhone(regForm.phone);
      setPassword(regForm.password);
    } catch (err: any) {
      const respData = err.response?.data;
      if (respData?.error?.details && Array.isArray(respData.error.details)) {
        const fieldMsgs = respData.error.details.map((d: any) => `${d.field}: ${d.message}`).join(", ");
        setAuthError(`Validation Failed — ${fieldMsgs}`);
      } else {
        setAuthError(respData?.message || respData?.error?.message || "Registration failed");
      }
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
      <div className="flex min-h-screen bg-[#090D1A] overflow-hidden text-slate-100 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Left Side: Splash Banner */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to bottom, rgba(5, 10, 30, 0.7), rgba(9, 13, 26, 0.95)), url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80')" }}>
          {/* Logo */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="bg-blue-600/10 p-2.5 rounded-2xl border border-blue-500/25 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-blue-500 tracking-tighter">G</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-white tracking-tight uppercase">Go<span className="text-blue-500">Motor</span>Car</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Franchise</p>
            </div>
          </div>

          {/* Marketing text */}
          <div className="z-10 max-w-md my-auto">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Drive Success <br />
              With <span className="text-blue-500">GoMotor</span>Car <br />
              Franchise
            </h1>
            <div className="h-1.5 w-16 bg-blue-500 rounded-full mb-6"></div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Manage bookings, customers, earnings and your team all in one place. Scale your business operations effortlessly.
            </p>
          </div>

          {/* Footer Badge */}
          <div className="z-10 flex items-center justify-between border-t border-slate-800/60 pt-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <span className="text-blue-500">🛡️</span> Secure. Reliable. Everywhere.
            </div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
          <div className="w-full max-w-md bg-[#0F172A]/85 backdrop-blur-md p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-800/80">
            {/* Header info */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {!isRegisterMode ? "Welcome Back!" : "Register Partner"}
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                {!isRegisterMode 
                  ? "Login to your GoMotorCar franchise account" 
                  : "Submit your details to apply for a franchise partnership"}
              </p>
            </div>

            {/* Error notifications */}
            {authError && (
              <div className="mb-6 rounded-2xl bg-red-950/40 p-4 border border-red-500/20 text-sm text-red-400 font-medium">
                ⚠️ {authError}
              </div>
            )}

            {!isRegisterMode ? (
              /* Login Form */
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="flex bg-[#1E293B]/60 p-1 rounded-xl border border-slate-800 mb-6">
                  <button type="button" className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg transition-all shadow-sm">
                    📱 Mobile Number
                  </button>
                  <button type="button" className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-all">
                    ✉️ Email
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 bg-[#1E293B]/40 border border-slate-800 rounded-xl px-3 text-sm text-slate-300">
                      🇮🇳 <span>+91</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter mobile number"
                      value={phone.replace(/^\+91/, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val ? "+91" + val : "");
                      }}
                      className="flex-1 rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button type="button" className="text-xs font-semibold text-blue-500 hover:text-blue-400">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white focus:outline-none cursor-pointer"
                    >
                      {showLoginPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" id="remember" defaultChecked className="rounded border-slate-700 bg-[#1E293B] text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" />
                  <label htmlFor="remember" className="text-xs text-slate-400 font-medium cursor-pointer select-none">Remember Me</label>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span>Logging in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="text-base">🚀</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button type="button" className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.838 15.539.8 12.24.8 6.033.8 1 5.833 1 12.04s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.746-.08-1.32-.176-1.88H12.24z"/></svg>
                  <span>Continue with Google</span>
                </button>

                <div className="text-center pt-4">
                  <p className="text-slate-400 text-xs">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-blue-500 hover:text-blue-400 font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Franchise Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter franchise name"
                      value={regForm.franchiseName}
                      onChange={(e) => setRegForm({ ...regForm, franchiseName: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Franchise Type</label>
                    <select
                      value={regForm.type}
                      onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    >
                      <option value="cleaning_station">CSP (Car Service Point)</option>
                      <option value="service_center">Authorized Service Center</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Owner Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Owner full name"
                      value={regForm.ownerName}
                      onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      required
                      placeholder="10 digit number"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@email.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        placeholder="Create password"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white focus:outline-none cursor-pointer"
                      >
                        {showRegPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Shop address, Sector/Street name"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Gurgaon"
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="122001"
                      value={regForm.pincode}
                      onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
                      className="w-full rounded-xl bg-[#1E293B]/40 border border-slate-850 text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="flex-1 py-3 bg-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold transition-all text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all text-xs tracking-wider uppercase cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? "Registering..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
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
            <div className="space-y-6 text-slate-100">
              {/* Row 1: Key Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
                    <span className="p-2 bg-blue-600/10 rounded-xl text-blue-500 text-sm">📅</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.todayBookings || '24'}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ 20%</span> <span className="text-slate-500 font-normal">vs yesterday</span>
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Services</span>
                    <span className="p-2 bg-indigo-600/10 rounded-xl text-indigo-500 text-sm">⚡</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.activeBookings || '18'}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ 12%</span> <span className="text-slate-500 font-normal">vs yesterday</span>
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
                    <span className="p-2 bg-emerald-600/10 rounded-xl text-emerald-500 text-sm">₹</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">₹{(profile?.stats?.totalRevenue || 245680).toLocaleString()}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ 18%</span> <span className="text-slate-500 font-normal">vs last month</span>
                  </p>
                </div>

                {/* Card 4 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payments</span>
                    <span className="p-2 bg-amber-600/10 rounded-xl text-amber-500 text-sm">💳</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">₹{Math.round((profile?.stats?.totalRevenue || 245680) * 0.19).toLocaleString()}</p>
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↓ 8%</span> <span className="text-slate-500 font-normal">vs last month</span>
                  </p>
                </div>
              </div>

              {/* Row 2: Secondary stats and charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Stat 1 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Present</span>
                    <span className="text-xs text-slate-400">👥</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">12 / 15</p>
                  <p className="text-xs text-slate-400 mt-1">80% Present</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Customers</span>
                    <span className="text-xs text-slate-400">👤</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">36</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↑ 15% <span className="text-slate-500 font-normal">vs last month</span></p>
                </div>

                {/* Stat 3 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Ratings</span>
                    <span className="text-xs text-slate-400">⭐</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{profile?.stats?.rating || '4.7'} / 5</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↑ 0.3 <span className="text-slate-500 font-normal">vs last month</span></p>
                </div>

                {/* Stat 4 */}
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Complaints</span>
                    <span className="text-xs text-slate-400">⚠️</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">5</p>
                  <p className="text-xs text-rose-500 font-semibold mt-1">↓ 10% <span className="text-slate-500 font-normal">vs last month</span></p>
                </div>
              </div>

              {/* Row 3: Appointments, Activities, and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Appointments */}
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white tracking-wide">Upcoming Appointments</h3>
                      <button onClick={() => setActiveTab("bookings")} className="text-xs text-blue-500 hover:text-blue-400 font-semibold">View All</button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { time: '10:00 AM', name: 'Ravi Sharma', service: 'Steam Wash', plate: 'DL 10 AB 1234' },
                        { time: '11:30 AM', name: 'Neha Gupta', service: 'Interior Cleaning', plate: 'HR 26 CD 5678' },
                        { time: '01:00 PM', name: 'Amit Verma', service: 'Foam Wash', plate: 'UP 16 EF 9012' },
                        { time: '03:30 PM', name: 'Pooja Singh', service: 'Ceramic Coating', plate: 'MH 02 GH 3456' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                          <div>
                            <span className="text-xs font-bold text-blue-400">{item.time}</span>
                            <p className="text-xs font-bold text-white mt-0.5">{item.name}</p>
                            <span className="text-[10px] text-slate-400">{item.plate} | {item.service}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-bold uppercase">Upcoming</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Recent Activities */}
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white tracking-wide">Recent Activities</h3>
                      <button className="text-xs text-blue-500 hover:text-blue-400 font-semibold">View All</button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: 'New booking created', time: '10:15 AM', desc: 'Ravi Sharma - Steam Wash' },
                        { title: 'Payment received', time: '09:45 AM', desc: '₹1,250 from Neha Gupta' },
                        { title: 'New customer added', time: '09:30 AM', desc: 'Amit Verma' },
                        { title: 'Service completed', time: '09:10 AM', desc: 'Foam Wash - UP 14 GH 3456' },
                        { title: 'Complaint raised', time: '08:50 AM', desc: 'Water leakage issue' },
                      ].map((act, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white">{act.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{act.desc}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Quick Actions */}
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab("bookings")} className="flex flex-col items-center justify-center p-5 bg-blue-600/10 hover:bg-blue-600/15 rounded-2xl border border-blue-500/20 gap-2 cursor-pointer transition-all">
                        <span className="text-xl">📅</span>
                        <span className="text-xs font-semibold text-blue-400">Create Booking</span>
                      </button>
                      <button onClick={() => setActiveTab("profile")} className="flex flex-col items-center justify-center p-5 bg-emerald-600/10 hover:bg-emerald-600/15 rounded-2xl border border-emerald-500/20 gap-2 cursor-pointer transition-all">
                        <span className="text-xl">👤</span>
                        <span className="text-xs font-semibold text-emerald-400">Add Customer</span>
                      </button>
                      <button onClick={() => setActiveTab("staff")} className="flex flex-col items-center justify-center p-5 bg-purple-600/10 hover:bg-purple-600/15 rounded-2xl border border-purple-500/20 gap-2 cursor-pointer transition-all">
                        <span className="text-xl">👥</span>
                        <span className="text-xs font-semibold text-purple-400">Add Staff</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-5 bg-rose-600/10 hover:bg-rose-600/15 rounded-2xl border border-rose-500/20 gap-2 cursor-pointer transition-all">
                        <span className="text-xl">⚠️</span>
                        <span className="text-xs font-semibold text-rose-400">Raise Complaint</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Notifications Bar */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                  <button className="text-xs text-blue-500 hover:text-blue-400 font-semibold">Mark all as read</button>
                </div>
                <div className="space-y-3.5">
                  {[
                    { title: 'New booking received for today at 04:30 PM', desc: 'Customer: Vikram Patel | Service: Steam Wash', time: '5m ago' },
                    { title: 'Payment of ₹2,450 received successfully', desc: 'Booking ID: BK-1256', time: '15m ago' },
                    { title: 'Complaint raised by Neha Gupta', desc: 'Regarding: Service delay', time: '1h ago' },
                    { title: 'Monthly report is ready', desc: 'Click to view your April 2025 performance report', time: '2h ago' },
                  ].map((notif, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-slate-850/60">
                      <div>
                        <p className="text-xs font-semibold text-white">{notif.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{notif.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && selectedBookingId && (
            (() => {
              const b = bookings.find(item => item._id === selectedBookingId) || bookings[0] || {
                _id: selectedBookingId,
                bookingId: 'GMF12580',
                status: 'Confirmed',
                slotDate: new Date('2025-05-26T10:00:00Z'),
                slotTime: '10:00 AM',
                customerName: 'Rahul Sharma',
                vehicleNumber: 'UP 16 AB 1234',
                serviceName: 'Premium Steam Wash',
                totalAmount: 1250,
                paymentStatus: 'paid'
              };

              return (
                <div className="space-y-6 text-slate-100 pb-10">
                  {/* Back Navigation Bar */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedBookingId(null)}
                      className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                    >
                      ← Back to Bookings
                    </button>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer">
                        Print Invoice
                      </button>
                      <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer">
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Booking ID Header Title */}
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-wide">Booking Details</h2>
                    <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase">
                      {b.status || 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 -mt-4">
                    Booking ID: <span className="font-black text-blue-500">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</span> | Booked on: 24 May 2025, 09:15 AM
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details Cards */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Section 1: Customer Details */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">👤</span> 1. Customer Details
                          </h3>
                          <button className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-base">
                            {String(b.customerName || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white flex items-center gap-2">
                              {b.customerName || 'Rahul Sharma'} 
                              <span className="px-1.5 py-0.5 bg-blue-600/10 text-blue-400 rounded text-[9px] font-bold">VIP</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">📞 +91 98765 43210</p>
                            <p className="text-xs text-slate-400 mt-0.5">✉️ rahulsharma@gmail.com</p>
                            <p className="text-xs text-slate-400 mt-1">📍 Sector 62, Noida, Uttar Pradesh - 201301</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Vehicle Information */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">🚗</span> 2. Vehicle Information
                          </h3>
                          <button className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400">Vehicle Name</p>
                            <p className="text-sm font-bold text-white mt-1">{b.vehicleNumber || 'Toyota Fortuner'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Plate Number</p>
                            <p className="text-sm font-bold text-blue-400 mt-1">UP 16 AB 1234</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Color</p>
                            <p className="text-white mt-0.5">White</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Fuel Type</p>
                            <p className="text-white mt-0.5">Diesel</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Service Package */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">📦</span> 3. Service Package
                          </h3>
                          <button className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        </div>
                        <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                          <div>
                            <p className="text-sm font-black text-white">{b.serviceName || 'Premium Steam Wash'}</p>
                            <p className="text-xs text-slate-400 mt-1">Includes 6 detailed cleaning services</p>
                          </div>
                          <p className="text-sm font-black text-emerald-400">₹{b.totalAmount || '1,250'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">✓ Exterior Foam Wash</div>
                          <div className="flex items-center gap-1.5">✓ Tyre & Rim Cleaning</div>
                          <div className="flex items-center gap-1.5">✓ Interior Vacuum Cleaning</div>
                          <div className="flex items-center gap-1.5">✓ Dashboard Polishing</div>
                          <div className="flex items-center gap-1.5">✓ Steam Disinfection</div>
                        </div>
                      </div>

                      {/* Section 4: Assigned Staff */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">👥</span> 4. Assigned Staff
                          </h3>
                          <button className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">AV</div>
                            <div>
                              <p className="text-xs font-bold text-white">Amit Verma</p>
                              <p className="text-[10px] text-slate-400">Senior Technician • ⭐ 4.8</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">RK</div>
                            <div>
                              <p className="text-xs font-bold text-white">Rohit Kumar</p>
                              <p className="text-[10px] text-slate-400">Helper • ⭐ 4.6</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Payment Details */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">💳</span> 5. Payment Details
                          </h3>
                          <button className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-4 border-b border-slate-800">
                          <div>
                            <p className="text-slate-400">Payment Method</p>
                            <p className="text-white font-bold mt-1">UPI (Google Pay)</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Transaction ID</p>
                            <p className="text-white font-bold mt-1">UPI41589632578</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Subtotal</p>
                            <p className="text-white mt-1">₹1,250</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Discount</p>
                            <p className="text-white mt-1">-₹0</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {b.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                          </span>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 mr-2">Total Amount</span>
                            <span className="text-base font-black text-emerald-400">₹{b.totalAmount || '1,250'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 6: Timeline */}
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 mb-4">
                          <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">⏱️</span> 6. Timeline
                        </h3>
                        <div className="space-y-4 relative pl-5 border-l border-slate-800">
                          <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <p className="text-xs font-bold text-white">Booking Created</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">24 May 2025, 09:15 AM</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <p className="text-xs font-bold text-white">Booking Confirmed</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">24 May 2025, 09:16 AM</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                            <p className="text-xs font-bold text-slate-400">Customer Arrived</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">-</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Overview cards */}
                    <div className="space-y-6">
                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <h3 className="text-sm font-bold text-white tracking-wide mb-4">Booking Overview</h3>
                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Booking ID</span>
                            <span className="text-blue-500 font-bold">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Booking Date</span>
                            <span className="text-white font-bold">24 May 2025, 09:15 AM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Booking Type</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">Walk-in</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Payment Status</span>
                            <span className="text-emerald-400 font-bold uppercase">{b.paymentStatus || 'Paid'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <h3 className="text-sm font-bold text-white tracking-wide mb-4">Price Summary</h3>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Service Amount</span>
                            <span className="text-white">₹{b.totalAmount || '1,250'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Discount</span>
                            <span className="text-white">₹0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tax</span>
                            <span className="text-white">₹0</span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-slate-850">
                            <span className="font-bold text-white">Total Amount</span>
                            <span className="font-black text-emerald-400 text-sm">₹{b.totalAmount || '1,250'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                        <h3 className="text-sm font-bold text-white tracking-wide mb-3">Notes</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Customer requested extra interior fragrance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Controls Sticky Bar */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
                    <button className="px-5 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      Cancel Booking
                    </button>
                    <button className="px-5 py-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      Reschedule
                    </button>
                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <>
                        {b.status !== 'in_progress' ? (
                          <button 
                            onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all ml-auto"
                          >
                            Start Service
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all ml-auto"
                          >
                            Complete Service
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === "bookings" && !selectedBookingId && (
            <div className="space-y-6 text-slate-100">
              {/* Header section with description */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Booking Dashboard</h2>
                <p className="text-xs text-slate-400 mt-1">Manage and track all your bookings in one place.</p>
              </div>

              {/* Status Tab buttons with count badges */}
              <div className="flex border-b border-slate-800 bg-[#1E293B]/40 p-1.5 rounded-2xl gap-2 overflow-x-auto">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                  <span>Upcoming</span>
                  <span className="px-2 py-0.5 bg-white/25 rounded-md text-[10px] font-extrabold">{bookings.filter(b => !['completed', 'cancelled', 'in_progress'].includes(b.status)).length || '24'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all whitespace-nowrap">
                  <span>Ongoing</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-extrabold">{bookings.filter(b => b.status === 'in_progress').length || '8'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all whitespace-nowrap">
                  <span>Completed</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-extrabold">{bookings.filter(b => b.status === 'completed').length || '156'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all whitespace-nowrap">
                  <span>Cancelled</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-extrabold">{bookings.filter(b => b.status === 'cancelled').length || '12'}</span>
                </button>
              </div>

              {/* Filters & search panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[240px]">
                    <input
                      type="text"
                      placeholder="Search by Booking ID, Customer or Mobile..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  </div>

                  <select className="rounded-xl bg-slate-900 border border-slate-800 text-white py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs cursor-pointer">
                    <option>Select Date</option>
                  </select>

                  <select className="rounded-xl bg-slate-900 border border-slate-800 text-white py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs cursor-pointer">
                    <option>Status</option>
                  </select>

                  <select className="rounded-xl bg-slate-900 border border-slate-800 text-white py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs cursor-pointer">
                    <option>Service Type</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/15 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Filter ⚙️
                  </button>
                  <button className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer">
                    Clear All
                  </button>
                </div>
              </div>

              {/* Bookings rows list */}
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => setSelectedBookingId(b._id)}
                    className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-600/30 hover:bg-[#1E293B]/90 transition-all grid grid-cols-1 md:grid-cols-5 gap-5 items-center cursor-pointer"
                  >
                    {/* Col 1: Booking ID & Date */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booking ID</span>
                      <p className="text-sm font-black text-blue-500 mt-1">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</p>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                        <span>📅</span>
                        <span>{b.slotDate ? new Date(b.slotDate).toLocaleDateString() : '26 May 2025'}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-5">{b.slotTime || '10:00 AM'}</p>
                    </div>

                    {/* Col 2: Customer Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {String(b.customerName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{b.customerName || 'Ravi Sharma'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">📞 +91 98765 43210</p>
                        <p className="text-[9px] text-slate-500 truncate mt-1">📍 Sector 62, Noida</p>
                      </div>
                    </div>

                    {/* Col 3: Vehicle Details */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vehicle Details</span>
                      <p className="text-xs font-bold text-white mt-1">{b.vehicleNumber || 'Toyota Fortuner'}</p>
                      <p className="text-[10px] text-slate-400">UP 16 AB 1234 • White</p>
                    </div>

                    {/* Col 4: Service & Amount */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service</span>
                      <p className="text-xs font-bold text-white mt-1">{b.serviceName || 'Steam Car Wash'}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400">Amount</span>
                        <span className="text-xs font-black text-emerald-400">₹{b.totalAmount || '1,250'}</span>
                      </div>
                    </div>

                    {/* Col 5: Status & Actions */}
                    <div className="flex flex-col md:items-end gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : b.status === "cancelled"
                            ? "bg-red-500/20 text-red-400"
                            : b.status === "in_progress"
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {b.status || 'Upcoming'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {b.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>

                      {b.status !== 'completed' && b.status !== 'cancelled' && (
                        <div className="flex gap-2 w-full md:w-auto">
                          {b.status !== 'in_progress' ? (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                              disabled={actionLoading === b._id}
                              className="flex-1 md:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all"
                            >
                              Start Ongoing
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                              disabled={actionLoading === b._id}
                              className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {bookings.length === 0 && (
                  <div className="text-center py-16 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No bookings found matching selected category.
                  </div>
                )}
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

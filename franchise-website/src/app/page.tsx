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

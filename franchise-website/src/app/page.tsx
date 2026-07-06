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
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "customers" | "vehicles" | "services" | "staff" | "attendance" | "inventory" | "earnings" | "wallet" | "transactions" | "invoices" | "offers" | "ratings" | "complaints" | "reports" | "notifications" | "support" | "business_profile" | "profile" | "settings">("dashboard");

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
    bookingsGrowth: 20,
    servicesGrowth: 12,
    monthlyRevenue: 245680,
    revenueGrowth: 18,
    pendingPayments: 46679,
    paymentGrowth: 8,
    staffPresent: 12,
    totalStaff: 15,
    attendancePercentage: 80,
    newCustomers: 36,
    customerGrowth: 15,
    rating: 4.7,
    ratingGrowth: 0.3,
    pendingComplaints: 5,
    complaintReduction: 10,
  });
  const defaultBookings = [
    {
      _id: "default_1",
      bookingId: "GMF12580",
      slotDate: "2026-05-26",
      slotTime: "10:00 AM",
      customerName: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "Sector 62, Noida, Uttar Pradesh - 201301",
      vehicleNumber: "Toyota Fortuner",
      plateNumber: "UP 16 AB 1234",
      color: "White",
      serviceName: "Steam Car Wash",
      totalAmount: 1250,
      status: "booked",
      paymentStatus: "paid"
    },
    {
      _id: "default_2",
      bookingId: "GMF12579",
      slotDate: "2026-05-26",
      slotTime: "11:30 AM",
      customerName: "Neha Gupta",
      phone: "+91 91234 56789",
      address: "Gaur City 2, Noida, Uttar Pradesh - 201009",
      vehicleNumber: "Honda City",
      plateNumber: "UP 14 CD 5678",
      color: "Blue",
      serviceName: "Interior Cleaning",
      totalAmount: 850,
      status: "booked",
      paymentStatus: "pending"
    },
    {
      _id: "default_3",
      bookingId: "GMF12578",
      slotDate: "2026-05-26",
      slotTime: "01:00 PM",
      customerName: "Amit Verma",
      phone: "+91 99887 66554",
      address: "Wave City, Ghaziabad, Uttar Pradesh - 201015",
      vehicleNumber: "Hyundai Creta",
      plateNumber: "UP 14 EF 9012",
      color: "Silver",
      serviceName: "Foam Wash",
      totalAmount: 650,
      status: "booked",
      paymentStatus: "paid"
    },
    {
      _id: "default_4",
      bookingId: "GMF12577",
      slotDate: "2026-05-26",
      slotTime: "02:30 PM",
      customerName: "Karan Singh",
      phone: "+91 88990 11223",
      address: "Indirapuram, Ghaziabad, Uttar Pradesh - 201014",
      vehicleNumber: "Mahindra Thar",
      plateNumber: "UP 14 GH 3456",
      color: "Black",
      serviceName: "Ceramic Coating",
      totalAmount: 3500,
      status: "booked",
      paymentStatus: "pending"
    }
  ];
  const [bookings, setBookings] = useState<any[]>(defaultBookings);
  const [staffList, setStaffList] = useState<any[]>([
    { _id: "1", firstName: "Rajesh", lastName: "Kumar", role: "Mechanic", phone: "+91-9876543210", isActive: true },
    { _id: "2", firstName: "Suresh", lastName: "Patel", role: "Electrician", phone: "+91-9876543211", isActive: true },
    { _id: "3", firstName: "Amit", lastName: "Singh", role: "Detailer", phone: "+91-9876543212", isActive: false },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<any | null>(null);
  const [servicesList, setServicesList] = useState<any[]>([
    { _id: 'ser_1', name: 'Exterior Wash', cat: 'Wash', price: 299, dur: '30 mins', status: 'Active', desc: 'Complete exterior cleaning with foam wash and polish.', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=60&w=120', badge: 'bg-blue-50 text-blue-600' },
    { _id: 'ser_2', name: 'Interior Cleaning', cat: 'Cleaning', price: 499, dur: '45 mins', status: 'Active', desc: 'Complete vacuuming, dashboard cleaning and interior detailing.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=60&w=120', badge: 'bg-emerald-50 text-emerald-600' },
    { _id: 'ser_3', name: 'Steam Wash', cat: 'Wash', price: 699, dur: '60 mins', status: 'Active', desc: 'High pressure steam wash for exterior and interior.', img: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=60&w=120', badge: 'bg-blue-50 text-blue-600' },
    { _id: 'ser_4', name: 'Deep Cleaning', cat: 'Detailing', price: 999, dur: '90 mins', status: 'Active', desc: 'Advanced deep cleaning for complete car transformation.', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=60&w=120', badge: 'bg-purple-50 text-purple-600' },
    { _id: 'ser_5', name: 'Ceramic Coating', cat: 'Coating', price: 4999, dur: '120 mins', status: 'Active', desc: 'Long lasting ceramic coating for ultimate protection.', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=60&w=120', badge: 'bg-amber-50 text-amber-600' },
    { _id: 'ser_6', name: 'Foam Wash', cat: 'Wash', price: 399, dur: '30 mins', status: 'Active', desc: 'Foam wash to remove dirt and grime effectively.', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=60&w=120', badge: 'bg-blue-50 text-blue-600' },
    { _id: 'ser_7', name: 'Engine Wash', cat: 'Engine', price: 599, dur: '45 mins', status: 'Active', desc: 'Engine bay deep cleaning and degreasing.', img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=60&w=120', badge: 'bg-red-50 text-red-650' },
  ]);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState("all");
  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState("all");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("all");
  const [attendanceType, setAttendanceType] = useState("manual"); // manual, selfie, geo
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([
    { id: 'STF001', name: 'Amit Verma', dep: 'Operations', role: 'Supervisor', checkin: '09:15 AM', checkinDate: '26 May 2025', checkout: '06:05 PM', checkoutDate: '26 May 2025', hours: '8h 50m', location: 'Sector 62, Noida', status: 'Present', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: 'STF002', name: 'Rahul Sharma', dep: 'Cleaning', role: 'Technician', checkin: '08:58 AM', checkinDate: '26 May 2025', checkout: '05:42 PM', checkoutDate: '26 May 2025', hours: '8h 44m', location: 'Sector 63, Noida', status: 'Present', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
    { id: 'STF003', name: 'Vikram Singh', dep: 'Cleaning', role: 'Cleaner', checkin: '--', checkinDate: '', checkout: '--', checkoutDate: '', hours: '--', location: '--', status: 'Absent', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
    { id: 'STF004', name: 'Sandeep Yadav', dep: 'Detailing', role: 'Detailer', checkin: '09:05 AM', checkinDate: '26 May 2025', checkout: '06:02 PM', checkoutDate: '26 May 2025', hours: '8h 57m', location: 'Sector 61, Noida', status: 'Present', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150' },
    { id: 'STF005', name: 'Mohit Kumar', dep: 'Mechanical', role: 'Technician', checkin: '09:20 AM', checkinDate: '26 May 2025', checkout: '--', checkoutDate: '', hours: '--', location: 'Sector 62, Noida', status: 'On Leave', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' }
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewInventoryDashboard, setViewInventoryDashboard] = useState(false);
  const [viewCouponManagement, setViewCouponManagement] = useState(false);
  const [viewPricingManagement, setViewPricingManagement] = useState(false);
  const [viewNewBooking, setViewNewBooking] = useState(false);
  const [viewProgressTracking, setViewProgressTracking] = useState(false);

  // Search & Filter States for Bookings
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "upcoming" | "ongoing" | "completed" | "cancelled">("all");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [bookingServiceFilter, setBookingServiceFilter] = useState("");

  // Search & Filter States for Customers
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");

  // Create Booking Form States
  const [newBookingCustomerSearch, setNewBookingCustomerSearch] = useState("");
  const [selectedCustomerForBooking, setSelectedCustomerForBooking] = useState<any>(null);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<any>(null);
  const [selectedServicePackage, setSelectedServicePackage] = useState("Premium Steam Wash");
  const [selectedBookingDate, setSelectedBookingDate] = useState("2026-05-26");
  const [selectedBookingTime, setSelectedBookingTime] = useState("10:00 AM");
  const [selectedServicesChecklist, setSelectedServicesChecklist] = useState<string[]>(["Steam Wash"]);
  const [bookingNotes, setBookingNotes] = useState("");
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // New staff form state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleEditServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setServicesList(prev => prev.map(item => 
      item._id === editingService._id ? {
        ...editingService,
        badge: editingService.cat === 'Wash' ? 'bg-blue-50 text-blue-600' :
               editingService.cat === 'Cleaning' ? 'bg-emerald-50 text-emerald-600' :
               editingService.cat === 'Detailing' ? 'bg-purple-50 text-purple-600' :
               editingService.cat === 'Coating' ? 'bg-amber-50 text-amber-600' :
               'bg-red-50 text-red-650'
      } : item
    ));
    setEditingService(null);
  };

  const handleEditVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setVehiclesList(prev => prev.map(item => 
      (item.plate === editingVehicle.plate || item._id === editingVehicle._id) ? editingVehicle : item
    ));
    setEditingVehicle(null);
  };

  const handleEditCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const nameStr = editingCustomer.name || "";
      const parts = nameStr.trim().split(" ");
      const firstName = parts[0] || "Customer";
      const lastName = parts.slice(1).join(" ") || "";

      // Only make API call for non-seeded customers
      if (editingCustomer._id && !editingCustomer._id.startsWith("default_") && !editingCustomer._id.startsWith("cust_")) {
        await api.put(`/customer/${editingCustomer._id}`, {
          firstName,
          lastName,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          address: editingCustomer.address
        });
      }

      // Update locally
      setCustomersList(prev => prev.map(c => {
        if (c._id === editingCustomer._id) {
          return {
            ...c,
            name: nameStr,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            address: editingCustomer.address
          };
        }
        return c;
      }));

      setEditingCustomer(null);
    } catch (err) {
      console.error("Failed to update customer:", err);
      // Update locally anyway
      setCustomersList(prev => prev.map(c => {
        if (c._id === editingCustomer._id) {
          return {
            ...c,
            name: editingCustomer.name,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            address: editingCustomer.address
          };
        }
        return c;
      }));
      setEditingCustomer(null);
    }
  };

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

  const fetchCustomersData = async (currentVehicles?: any[]) => {
    try {
      const response = await api.get("/customer", { params: { limit: 100 } });
      const apiItems = response.data?.data?.items || response.data?.data || [];
      
      const defaultCusts = [
        {
          _id: "default_cust_1",
          name: "Rahul Sharma",
          email: "rahul.sharma@email.com",
          phone: "+91 98765 43210",
          vehicle: "Toyota Fortuner",
          plateNumber: "UP 16 AB 1234",
          lastVisitDate: "24 May 2025",
          lastVisitTime: "09:15 AM",
          bookingsCount: 18,
          type: "Repeat",
          isVip: true
        },
        {
          _id: "default_cust_2",
          name: "Neha Gupta",
          email: "neha.gupta@email.com",
          phone: "+91 91234 56789",
          vehicle: "Honda City",
          plateNumber: "UP 14 CD 5678",
          lastVisitDate: "22 May 2025",
          lastVisitTime: "11:30 AM",
          bookingsCount: 9,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_3",
          name: "Amit Verma",
          email: "amit.verma@email.com",
          phone: "+91 99887 66554",
          vehicle: "Hyundai Creta",
          plateNumber: "UP 14 EF 9012",
          lastVisitDate: "20 May 2025",
          lastVisitTime: "04:45 PM",
          bookingsCount: 6,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_4",
          name: "Pooja Singh",
          email: "pooja.singh@email.com",
          phone: "+91 87654 32109",
          vehicle: "Maruti Swift",
          plateNumber: "UP 16 GH 7890",
          lastVisitDate: "15 May 2025",
          lastVisitTime: "10:20 AM",
          bookingsCount: 3,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_5",
          name: "Vikram Patel",
          email: "vikram.patel@email.com",
          phone: "+91 96325 47896",
          vehicle: "Mahindra Thar",
          plateNumber: "UP 14 GH 3456",
          lastVisitDate: "10 May 2025",
          lastVisitTime: "03:10 PM",
          bookingsCount: 1,
          type: "New",
          isVip: false
        },
        {
          _id: "default_cust_6",
          name: "Anjali Mehta",
          email: "anjali.mehta@email.com",
          phone: "+91 84562 36987",
          vehicle: "Skoda Slavia",
          plateNumber: "UP 16 KL 1122",
          lastVisitDate: "08 May 2025",
          lastVisitTime: "02:40 PM",
          bookingsCount: 1,
          type: "New",
          isVip: false
        }
      ];

      const merged = [...defaultCusts];
      apiItems.forEach((apiItem: any) => {
        // Find matching customer vehicle
        const vList = currentVehicles || vehiclesList || [];
        const customerVeh = vList.find(v => v?.customerId === apiItem?._id) || {};
        const normalized = {
          _id: apiItem._id,
          name: `${apiItem.firstName || ""} ${apiItem.lastName || ""}`.trim() || "Customer",
          email: apiItem.email || "no-email@gomotarcar.com",
          phone: apiItem.phone || "+91 98765 43210",
          vehicle: customerVeh.brand ? `${customerVeh.brand} ${customerVeh.model || ""}` : "Toyota Fortuner",
          plateNumber: customerVeh.plateNumber || customerVeh.vehicleNumber || "UP 16 AB 1234",
          lastVisitDate: "26 May 2025",
          lastVisitTime: "10:00 AM",
          bookingsCount: apiItem.totalBookings || 1,
          type: (apiItem.totalBookings || 1) > 1 ? "Repeat" : "New",
          isVip: (apiItem.totalBookings || 1) > 5
        };
        const existingIdx = merged.findIndex(x => x.phone === normalized.phone || x._id === normalized._id);
        if (existingIdx !== -1) {
          merged[existingIdx] = { ...merged[existingIdx], ...normalized };
        } else {
          merged.push(normalized);
        }
      });

      setCustomersList(merged);
    } catch (e) {
      console.error(e);
      // Fallback: set to default customers so page is populated even if API is empty or fails!
      setCustomersList([
        {
          _id: "default_cust_1",
          name: "Rahul Sharma",
          email: "rahul.sharma@email.com",
          phone: "+91 98765 43210",
          vehicle: "Toyota Fortuner",
          plateNumber: "UP 16 AB 1234",
          lastVisitDate: "24 May 2025",
          lastVisitTime: "09:15 AM",
          bookingsCount: 18,
          type: "Repeat",
          isVip: true
        },
        {
          _id: "default_cust_2",
          name: "Neha Gupta",
          email: "neha.gupta@email.com",
          phone: "+91 91234 56789",
          vehicle: "Honda City",
          plateNumber: "UP 14 CD 5678",
          lastVisitDate: "22 May 2025",
          lastVisitTime: "11:30 AM",
          bookingsCount: 9,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_3",
          name: "Amit Verma",
          email: "amit.verma@email.com",
          phone: "+91 99887 66554",
          vehicle: "Hyundai Creta",
          plateNumber: "UP 14 EF 9012",
          lastVisitDate: "20 May 2025",
          lastVisitTime: "04:45 PM",
          bookingsCount: 6,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_4",
          name: "Pooja Singh",
          email: "pooja.singh@email.com",
          phone: "+91 87654 32109",
          vehicle: "Maruti Swift",
          plateNumber: "UP 16 GH 7890",
          lastVisitDate: "15 May 2025",
          lastVisitTime: "10:20 AM",
          bookingsCount: 3,
          type: "Repeat",
          isVip: false
        },
        {
          _id: "default_cust_5",
          name: "Vikram Patel",
          email: "vikram.patel@email.com",
          phone: "+91 96325 47896",
          vehicle: "Mahindra Thar",
          plateNumber: "UP 14 GH 3456",
          lastVisitDate: "10 May 2025",
          lastVisitTime: "03:10 PM",
          bookingsCount: 1,
          type: "New",
          isVip: false
        },
        {
          _id: "default_cust_6",
          name: "Anjali Mehta",
          email: "anjali.mehta@email.com",
          phone: "+91 84562 36987",
          vehicle: "Skoda Slavia",
          plateNumber: "UP 16 KL 1122",
          lastVisitDate: "08 May 2025",
          lastVisitTime: "02:40 PM",
          bookingsCount: 1,
          type: "New",
          isVip: false
        }
      ]);
    }
  };

  const fetchVehiclesData = async () => {
    try {
      const response = await api.get("/vehicle", { params: { limit: 100 } });
      const items = response.data?.data?.items || response.data?.data || [];
      const list = items.length > 0 ? items : [
        { _id: "veh_1", customerId: "cust_1", brand: "Toyota", model: "Fortuner", plateNumber: "UP 16 AB 1234", color: "White", fuelType: "Diesel" },
        { _id: "veh_2", customerId: "cust_2", brand: "Honda", model: "City", plateNumber: "UP 14 CD 5678", color: "Blue", fuelType: "Petrol" },
        { _id: "veh_3", customerId: "cust_3", brand: "Hyundai", model: "Creta", plateNumber: "UP 14 EF 9012", color: "Silver", fuelType: "Petrol" },
        { _id: "veh_4", customerId: "cust_4", brand: "Mahindra", model: "Thar", plateNumber: "UP 14 GH 3456", color: "Black", fuelType: "Diesel" }
      ];
      setVehiclesList(list);
      return list;
    } catch (e) {
      console.error(e);
      const fallback = [
        { _id: "veh_1", customerId: "cust_1", brand: "Toyota", model: "Fortuner", plateNumber: "UP 16 AB 1234", color: "White", fuelType: "Diesel" },
        { _id: "veh_2", customerId: "cust_2", brand: "Honda", model: "City", plateNumber: "UP 14 CD 5678", color: "Blue", fuelType: "Petrol" },
        { _id: "veh_3", customerId: "cust_3", brand: "Hyundai", model: "Creta", plateNumber: "UP 14 EF 9012", color: "Silver", fuelType: "Petrol" },
        { _id: "veh_4", customerId: "cust_4", brand: "Mahindra", model: "Thar", plateNumber: "UP 14 GH 3456", color: "Black", fuelType: "Diesel" }
      ];
      setVehiclesList(fallback);
      return fallback;
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const initData = async () => {
        const vList = await fetchVehiclesData();
        await fetchCustomersData(vList);
      };
      fetchDashboardData();
      fetchBookingsData();
      fetchStaffData();
      initData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/franchise");
      if (response.data?.data) {
        const d = response.data.data;
        const bookingsCount = d.bookings?.total || 0;
        const completedCount = d.bookings?.completed || 0;
        const activeCount = d.bookings?.active || 0;
        const cleanCt = d.cleaners?.total || 0;
        const revTotal = d.revenue?.total || 0;
        const revComm = d.revenue?.commission || 0;
        
        setStats({
          todayBookings: d.bookings?.today || d.stats?.todayBookings || activeCount,
          totalBookings: bookingsCount,
          pendingBookings: activeCount,
          completedBookings: completedCount,
          activeBookings: activeCount,
          bookingsGrowth: d.stats?.bookingsGrowth || 20,
          servicesGrowth: d.stats?.servicesGrowth || 12,
          monthlyRevenue: revTotal,
          revenueGrowth: d.stats?.revenueGrowth || 18,
          pendingPayments: Math.round(revTotal * 0.19) || revComm,
          paymentGrowth: d.stats?.paymentGrowth || 8,
          staffPresent: cleanCt || 12,
          totalStaff: cleanCt ? Math.max(cleanCt, 12) : 15,
          attendancePercentage: cleanCt ? 100 : 80,
          newCustomers: d.stats?.newCustomers || 36,
          customerGrowth: d.stats?.customerGrowth || 15,
          rating: d.profile?.rating || d.stats?.rating || 4.7,
          ratingGrowth: d.stats?.ratingGrowth || 0.3,
          pendingComplaints: d.stats?.pendingComplaints || 5,
          complaintReduction: d.stats?.complaintReduction || 10,
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
      const apiItems = response.data?.data?.items || response.data?.data || [];
      
      setBookings(prev => {
        const merged = [...prev];
        apiItems.forEach((apiItem: any) => {
          const normalized = {
            _id: apiItem._id,
            bookingId: apiItem.bookingId,
            slotDate: apiItem.slotDate,
            slotTime: apiItem.slotTime,
            customerName: apiItem.customerId ? `${apiItem.customerId.firstName || ""} ${apiItem.customerId.lastName || ""}`.trim() : (apiItem.customerName || "Unknown Customer"),
            phone: apiItem.customerId?.phone || apiItem.phone || "+91 98765 43210",
            address: apiItem.customerId?.defaultAddressId?.street || apiItem.address || "Noida, UP",
            vehicleNumber: apiItem.vehicleId ? `${apiItem.vehicleId.brand || apiItem.vehicleId.make || ""} ${apiItem.vehicleId.model || ""}`.trim() : (apiItem.vehicleNumber || "Toyota Fortuner"),
            plateNumber: apiItem.vehicleId?.plateNumber || apiItem.vehicleId?.vehicleNumber || apiItem.plateNumber || "UP 16 AB 1234",
            color: apiItem.vehicleId?.color || apiItem.color || "White",
            serviceName: apiItem.serviceName || "Steam Car Wash",
            totalAmount: apiItem.totalAmount || apiItem.basePrice || 1250,
            status: apiItem.status || "booked",
            paymentStatus: apiItem.paymentStatus || "pending"
          };
          const existingIdx = merged.findIndex(x => x.bookingId === normalized.bookingId || x._id === normalized._id);
          if (existingIdx !== -1) {
            merged[existingIdx] = { ...merged[existingIdx], ...normalized };
          } else {
            merged.push(normalized);
          }
        });
        return merged;
      });
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

  const handleCreateBooking = async () => {
    if (!selectedCustomerForBooking) {
      alert("Please select a customer first.");
      return;
    }
    if (!selectedVehicleForBooking) {
      alert("Please select a vehicle first.");
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerForBooking._id,
        vehicleId: selectedVehicleForBooking._id,
        serviceName: selectedServicePackage || "Premium Steam Wash",
        slotDate: selectedBookingDate,
        slotTime: selectedBookingTime,
        basePrice: selectedServicesChecklist.includes("Deep Cleaning") ? 700 : selectedServicesChecklist.includes("Steam Wash") ? 500 : 1250,
        discount: 0,
        serviceMode: "workshop"
      };

      const response = await api.post("/bookings", payload);
      if (response.data) {
        alert("Booking Created successfully! Booking ID: " + (response.data.data?.bookingId || "Successful"));
        setViewNewBooking(false);
        // Reset states
        setSelectedCustomerForBooking(null);
        setSelectedVehicleForBooking(null);
        setNewBookingCustomerSearch("");
        setSelectedServicePackage("Premium Steam Wash");
        setSelectedBookingDate("2026-05-26");
        setSelectedBookingTime("10:00 AM");
        setSelectedServicesChecklist(["Steam Wash"]);
        setBookingNotes("");
        // Refresh bookings & dashboard metrics
        fetchBookingsData();
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Failed to create booking: " + (err.response?.data?.message || err.response?.data?.error?.message || "Unknown error"));
    }
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
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to bottom, rgba(5, 10, 30, 0.45), rgba(9, 13, 26, 0.9)), url('https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80')" }}>
          {/* Logo */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="bg-blue-600/5 p-2 rounded-2xl border border-blue-500/10 flex items-center justify-center">
              <img src="/logo.png" className="w-12 h-12 object-contain" alt="GoMotorCar Logo" />
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
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Manage bookings, customers, earnings and your team all in one place. Scale your business operations effortlessly.
            </p>
            
            <div className="space-y-3.5 text-xs text-slate-350 border-t border-slate-800/60 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-sm">🛡️</span>
                <span>Trusted Service</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-sm">✨</span>
                <span>Premium Care</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-sm">⏱️</span>
                <span>On-Time Service</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-sm">👤</span>
                <span>Expert Cleaners</span>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="z-10 flex items-center justify-between border-t border-slate-800/60 pt-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <span className="text-blue-500">🛡️</span> Secure. Reliable. Everywhere.
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
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
            <h1 className="font-bold text-white tracking-wide">GoMotorCar</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Franchise Partner</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
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
            onClick={() => {
              setActiveTab("customers");
              setSelectedCustomerId(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "customers"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>👤</span> Customers
          </button>
          <button
            onClick={() => setActiveTab("vehicles")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "vehicles"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🚗</span> Vehicles
          </button>
          <button
            onClick={() => {
              setActiveTab("services");
              setViewPricingManagement(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🛠️</span> Services
          </button>
          <button
            onClick={() => {
              setActiveTab("staff");
              setSelectedStaffId(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "staff"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>👥</span> Staff
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "attendance"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📅</span> Attendance
          </button>
          <button
            onClick={() => {
              setActiveTab("inventory");
              setSelectedItemId(null);
              setViewInventoryDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📦</span> Inventory
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "earnings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📊</span> Earnings
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>💳</span> Wallet
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🔄</span> Transactions
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🧾</span> Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab("offers");
              setViewCouponManagement(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "offers"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🏷️</span> Offers & Promotions
          </button>
          <button
            onClick={() => setActiveTab("ratings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "ratings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>⭐</span> Ratings & Reviews
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "complaints"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>⚠️</span> Complaints
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>📊</span> Reports
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🔔</span> Notifications
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "support"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🎧</span> Support Center
          </button>
          <button
            onClick={() => setActiveTab("business_profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "business_profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>👤</span> Business Profile
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>⚙️</span> Profile & Account
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>🔒</span> Security Settings
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
        <header className={`${["bookings", "customers"].includes(activeTab) ? "bg-white border-b border-slate-200" : "bg-slate-950 border-b border-slate-800"} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-2xl">🚗</span>
            <h1 className={`font-bold ${["bookings", "customers"].includes(activeTab) ? "text-slate-800" : "text-white"} text-lg`}>GoMotorCar Franchise</h1>
          </div>
          <div className="hidden md:block">
            <h2 className={`text-xl font-bold ${["bookings", "customers"].includes(activeTab) ? "text-slate-800" : "text-white"}`}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className={`p-2 ${["bookings", "customers"].includes(activeTab) ? "text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200" : "text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800"} rounded-lg transition-all cursor-pointer`}
              title="Refresh Data"
            >
              🔄
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${["bookings", "customers"].includes(activeTab) ? "bg-blue-50 border border-blue-100 text-blue-600" : "bg-blue-600/20 border border-blue-500/40 text-blue-400"} flex items-center justify-center font-bold`}>
                {profile?.name?.charAt(0) || "F"}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-semibold ${["bookings", "customers"].includes(activeTab) ? "text-slate-800" : "text-white"} leading-tight`}>
                  {profile?.name || "Partner"}
                </p>
                <p className={`text-xs ${["bookings", "customers"].includes(activeTab) ? "text-slate-500" : "text-slate-400"}`}>
                  Franchise ID: {profile?.franchiseId || "GMF12345"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Mobile Tab bar */}
        <div className={`md:hidden flex ${["bookings", "customers"].includes(activeTab) ? "bg-white border-b border-slate-200" : "bg-slate-950 border-b border-slate-800"}`}>
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
        <main className={`flex-1 overflow-y-auto p-6 ${["bookings", "customers"].includes(activeTab) ? "bg-slate-50" : "bg-slate-900"}`}>
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
                <div onClick={() => setActiveTab("bookings")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
                    <span className="p-2 bg-blue-600/10 rounded-xl text-blue-500 text-sm">📅</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.todayBookings || 0}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ {stats.bookingsGrowth || 0}%</span> <span className="text-slate-500 font-normal">vs yesterday</span>
                  </p>
                </div>

                {/* Card 2 */}
                <div onClick={() => setActiveTab("bookings")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Services</span>
                    <span className="p-2 bg-indigo-600/10 rounded-xl text-indigo-500 text-sm">⚡</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.activeBookings || 0}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ {stats.servicesGrowth || 0}%</span> <span className="text-slate-500 font-normal">vs yesterday</span>
                  </p>
                </div>

                {/* Card 3 */}
                <div onClick={() => setActiveTab("earnings")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
                    <span className="p-2 bg-emerald-600/10 rounded-xl text-emerald-500 text-sm">₹</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">₹{(stats.monthlyRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↑ {stats.revenueGrowth || 0}%</span> <span className="text-slate-500 font-normal">vs last month</span>
                  </p>
                </div>

                {/* Card 4 */}
                <div onClick={() => setActiveTab("wallet")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 shadow-md cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payments</span>
                    <span className="p-2 bg-amber-600/10 rounded-xl text-amber-500 text-sm">💳</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">₹{(stats.pendingPayments || 0).toLocaleString()}</p>
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <span>↓ {stats.paymentGrowth || 0}%</span> <span className="text-slate-500 font-normal">vs last month</span>
                  </p>
                </div>
              </div>

              {/* Row 2: Secondary stats and charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Stat 1 */}
                <div onClick={() => setActiveTab("staff")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Present</span>
                    <span className="text-xs text-slate-400">👥</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.staffPresent || 0} / {stats.totalStaff || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">{stats.attendancePercentage || 0}% Present</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.attendancePercentage || 0}%` }}></div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div onClick={() => setActiveTab("customers")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Customers</span>
                    <span className="text-xs text-slate-400">👤</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.newCustomers || 0}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↑ {stats.customerGrowth || 0}% <span className="text-slate-500 font-normal">vs last month</span></p>
                </div>

                {/* Stat 3 */}
                <div onClick={() => setActiveTab("ratings")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Ratings</span>
                    <span className="text-xs text-slate-400">⭐</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.rating || 0} / 5</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↑ {stats.ratingGrowth || 0} <span className="text-slate-500 font-normal">vs last month</span></p>
                </div>

                {/* Stat 4 */}
                <div onClick={() => setActiveTab("complaints")} className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Complaints</span>
                    <span className="text-xs text-slate-400">⚠️</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.pendingComplaints || 0}</p>
                  <p className="text-xs text-rose-500 font-semibold mt-1">↓ {stats.complaintReduction || 0}% <span className="text-slate-500 font-normal">vs last month</span></p>
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

          {activeTab === "bookings" && viewNewBooking && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewNewBooking(false)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                >
                  ← Back to Bookings
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">New Booking</h2>
                <p className="text-xs text-slate-400 mt-1">Create a new service booking for your customer.</p>
              </div>

              {/* Section 1: Customer Details */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">👤</span> 1. Customer Details
                </h3>
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-400">Customer *</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Search customer by name or mobile number..." 
                      className="flex-1 rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs text-white"
                    />
                    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                      + Add New Customer
                    </button>
                  </div>

                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">RS</div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-2">Rahul Sharma <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[9px] font-bold">VIP</span></p>
                        <p className="text-[10px] text-slate-400 mt-0.5">📞 +91 98765 43210 | rahulsharma@gmail.com</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">📍 Sector 62, Noida, Uttar Pradesh - 201301</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-450">Total Bookings</p>
                      <p className="text-sm font-bold text-white mt-0.5">24</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Vehicle Details */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">🚗</span> 2. Vehicle Details
                </h3>
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-400">Vehicle *</label>
                  <div className="flex gap-3">
                    <select className="flex-1 rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs text-white">
                      <option>Select Vehicle</option>
                      <option selected>Toyota Fortuner (UP 16 AB 1234)</option>
                    </select>
                    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                      + Add New Vehicle
                    </button>
                  </div>

                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 flex items-center gap-4">
                    <div className="w-16 h-10 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-slate-500 text-sm">🚗</div>
                    <div className="grid grid-cols-3 gap-6 text-[10px]">
                      <div>
                        <p className="text-slate-400 font-bold">Toyota Fortuner</p>
                        <p className="text-blue-500 font-bold mt-0.5">UP 16 AB 1234</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-semibold">Color</p>
                        <p className="text-white font-bold mt-0.5">White</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-semibold">Fuel Type</p>
                        <p className="text-white font-bold mt-0.5">Diesel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Service Package */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">📦</span> 3. Service Package
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Service Package *</label>
                  <select className="w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs text-white cursor-pointer">
                    <option>Select a service package</option>
                    <option selected>Premium Steam Wash (₹1,250)</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Schedule Date & Time */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">📅</span> 4. Schedule Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Schedule Date *</label>
                    <input 
                      type="date" 
                      value="2026-05-26"
                      className="w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Schedule Time *</label>
                    <select className="w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white cursor-pointer">
                      <option>Select time</option>
                      <option selected>10:00 AM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Select Services Checklist */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-xs">🛒</span> 5. Select Services
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Choose one or more services for this booking.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Exterior Wash', price: '₹300', icon: '🚗' },
                    { label: 'Interior Cleaning', price: '₹400', icon: '🧼' },
                    { label: 'Steam Wash', price: '₹500', icon: '💨' },
                    { label: 'Deep Cleaning', price: '₹700', icon: '✨' },
                  ].map((srv, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-900 transition-all">
                      <span className="text-xl">{srv.icon}</span>
                      <p className="text-xs font-bold text-white">{srv.label}</p>
                      <span className="text-[10px] text-emerald-450 font-bold">{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Additional Notes */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide mb-3">6. Additional Notes (Optional)</h3>
                <textarea 
                  placeholder="Enter any special instructions or notes..."
                  className="w-full h-24 rounded-xl bg-slate-900 border border-slate-850 p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs text-white"
                />
              </div>

              {/* Booking Summary sticky bottom info */}
              <div className="bg-blue-600/5 p-5 rounded-2xl border border-blue-500/15 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400">Estimated Amount</p>
                  <p className="text-base font-black text-emerald-400 mt-1">₹1,250</p>
                </div>
                <div>
                  <p className="text-slate-400">Selected Services</p>
                  <p className="text-xs text-white font-bold mt-1">1 Package</p>
                </div>
                <div>
                  <p className="text-slate-400">Duration</p>
                  <p className="text-xs text-white font-bold mt-1">60 mins</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert("New Booking created successfully!");
                  setViewNewBooking(false);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Create Booking 🚀
              </button>
            </div>
          )}

          {activeTab === "bookings" && viewProgressTracking && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Back bar */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewProgressTracking(false)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                >
                  ← Back to Booking Details
                </button>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">Service Progress Tracking</h2>
                <span className="px-2 py-0.5 bg-indigo-500/25 text-indigo-400 rounded-full text-[10px] font-bold uppercase animate-pulse">In Progress</span>
              </div>
              <p className="text-xs text-slate-400 -mt-4">Track the real-time progress of the service.</p>

              {/* Booking Info Row header info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Booking ID</span>
                  <p className="text-sm font-black text-blue-500 mt-1">GMF12580</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Customer</span>
                  <p className="text-white font-bold mt-1">Rahul Sharma</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Vehicle</span>
                  <p className="text-white font-bold mt-1">Toyota Fortuner</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">UP 16 AB 1234</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Service</span>
                  <p className="text-white font-bold mt-1">Steam Car Wash</p>
                  <p className="text-[10px] text-emerald-450 font-bold mt-0.5">₹1,250</p>
                </div>
              </div>

              {/* Progress split timeline layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Progress Timeline */}
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-6">Service Progress Timeline</h3>
                  <div className="space-y-6 relative pl-6 border-l border-slate-800 ml-3">
                    {[
                      { title: 'Booking Accepted', done: true, time: '24 May 2025, 09:15 AM' },
                      { title: 'Vehicle Received', done: true, time: '24 May 2025, 10:00 AM' },
                      { title: 'Cleaning Started', done: true, time: '24 May 2025, 10:20 AM' },
                      { title: 'Work In Progress', current: true, time: '24 May 2025, 11:05 AM' },
                      { title: 'Quality Check', pending: true, time: 'Pending' },
                      { title: 'Ready For Delivery', pending: true, time: 'Pending' },
                      { title: 'Completed', pending: true, time: 'Pending' },
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full ${
                          step.done ? 'bg-emerald-500' : step.current ? 'bg-blue-500 animate-ping' : 'bg-slate-800 border border-slate-700'
                        }`} />
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <p className={`font-bold ${step.pending ? 'text-slate-550' : 'text-white'}`}>{step.title}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Our team is working on your vehicle</p>
                          </div>
                          <span className={`text-[10px] ${step.pending ? 'text-slate-550' : 'text-slate-400'} font-medium`}>{step.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Media uploads & photos updates */}
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Service Media Updates</h3>
                  <div className="flex gap-2 mb-4">
                    <button className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold">Before Images</button>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/60 rounded-lg text-xs text-slate-450">After Images</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="h-20 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-slate-500 text-xs border border-slate-800">Photo 1</div>
                    <div className="h-20 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-slate-500 text-xs border border-slate-800">Photo 2</div>
                  </div>
                  <div className="border border-dashed border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-900/20 transition-all text-xs">
                    <span className="text-lg">☁️</span>
                    <p className="font-bold text-white">Upload Before Images</p>
                    <span className="text-[9px] text-slate-500">JPG, PNG up to 10MB</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar updates */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button className="px-4 py-2.5 bg-red-650/10 hover:bg-red-650/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer">
                  Cancel Booking
                </button>
                <button className="px-4 py-2.5 bg-amber-650/10 hover:bg-amber-650/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-bold cursor-pointer">
                  Reschedule
                </button>
                <button 
                  onClick={() => {
                    alert("Service completed!");
                    setViewProgressTracking(false);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer ml-auto"
                >
                  Complete Service
                </button>
              </div>
            </div>
          )}

          {activeTab === "bookings" && selectedBookingId && !viewNewBooking && !viewProgressTracking && (() => {
            const b = bookings.find(item => item._id === selectedBookingId) || {
              bookingId: 'GMF12580',
              slotDate: '2025-05-24',
              slotTime: '10:00 AM',
              customerName: 'Rahul Sharma',
              vehicleNumber: 'UP 16 AB 1234',
              serviceName: 'Premium Steam Wash',
              totalAmount: 1250,
              paymentStatus: 'paid',
              status: 'upcoming'
            };

            const statusLabel = (b.status || 'upcoming').toLowerCase();
            const isPaid = (b.paymentStatus || 'paid').toLowerCase() === 'paid';

            return (
              <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
                {/* Back Nav bar */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedBookingId(null)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-850 cursor-pointer transition-all bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm"
                  >
                    ← Back to Bookings
                  </button>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                      <span>🖨️</span> Print Invoice
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                      <span>🔗</span> Share
                    </button>
                  </div>
                </div>

                {/* Header title */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Booking Details</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        statusLabel === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        statusLabel === 'cancelled' ? 'bg-red-50 text-red-600' :
                        statusLabel === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-505 mt-1">
                      Booking ID: <span className="font-bold text-blue-600">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</span> | Booked on: 24 May 2025, 09:15 AM
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewProgressTracking(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>⏱️</span> Track Live Progress
                  </button>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left columns */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* 1. Customer Details */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="text-blue-600 text-sm">👤</span> 1. Customer Details
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">Edit</button>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-150 flex items-center justify-center bg-blue-50 text-blue-600 text-lg font-black shadow-sm">
                          {String(b.customerName || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                            {b.customerName || 'Rahul Sharma'} 
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">VIP</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1.5">📞 +91 98765 43210</p>
                          <p className="text-xs text-slate-550 mt-0.5">✉️ rahulsharma@gmail.com</p>
                          <p className="text-xs text-slate-550 mt-1">📍 Sector 62, Noida, Uttar Pradesh - 201301</p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Vehicle Information */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="text-blue-600 text-sm">🚗</span> 2. Vehicle Information
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">Edit</button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-32 h-20 bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                          <img 
                            src={
                              (b.vehicleNumber || '').toLowerCase().includes('fortuner') ? 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('city') ? 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('creta') ? 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('thar') ? 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('slavia') ? 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('swift') ? 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=60&w=300' :
                              (b.vehicleNumber || '').toLowerCase().includes('virtus') ? 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=60&w=300' :
                              'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=60&w=300'
                            } 
                            alt="Vehicle"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800">{b.vehicleNumber || 'Toyota Fortuner'}</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">{b.plateNumber || 'UP 16 AB 1234'}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 pt-1">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Color</p>
                              <p className="text-slate-800 font-bold mt-0.5">White</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Model Year</p>
                              <p className="text-slate-800 font-bold mt-0.5">2021</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Fuel Type</p>
                              <p className="text-slate-800 font-bold mt-0.5">Diesel</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Service Package */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="text-blue-600 text-sm">🧼</span> 3. Service Package
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">Edit</button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                          💧
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">{b.serviceName || 'Premium Steam Wash'}</h4>
                              <p className="text-[10px] text-slate-405 font-medium mt-0.5">Includes 6 detailed cleaning services</p>
                            </div>
                            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">₹{b.totalAmount || '1,250'}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span> Exterior Foam Wash
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span> Tyre & Rim Cleaning
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span> Interior Vacuum Cleaning
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span> Dashboard Polishing
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span> Steam Disinfection
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Assigned Staff */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="text-blue-600 text-sm">👥</span> 4. Assigned Staff
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">Edit</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-150 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">AV</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Amit Verma</p>
                            <p className="text-[10px] text-slate-405 font-medium">Senior Technician</p>
                            <p className="text-[9px] text-amber-500 mt-0.5">⭐ 4.8 <span className="text-slate-400">(126 reviews)</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-150 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">RK</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Rohit Kumar</p>
                            <p className="text-[10px] text-slate-405 font-medium">Helper</p>
                            <p className="text-[9px] text-amber-500 mt-0.5">⭐ 4.6 <span className="text-slate-400">(89 reviews)</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Payment Details */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="text-blue-600 text-sm">💳</span> 5. Payment Details
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-4 border-b border-slate-100">
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Payment Method</p>
                          <p className="text-slate-800 font-black mt-1">UPI (Google Pay)</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Transaction ID</p>
                          <p className="text-slate-800 font-black mt-1">UPI41589632578</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Subtotal</p>
                          <p className="text-slate-850 font-bold mt-1">₹1,250</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Discount</p>
                          <p className="text-slate-855 font-bold mt-1">-₹0</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 mr-2 font-bold">Total Amount</span>
                          <span className="text-lg font-black text-emerald-600">₹{b.totalAmount || '1,250'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 6. Timeline */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-5">
                        <span className="text-blue-600 text-sm">⏱️</span> 6. Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-5 relative pl-5 border-l border-slate-200 ml-2">
                          <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            </div>
                            <p className="text-xs font-bold text-slate-800">Booking Created</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">24 May 2025, 09:15 AM</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            </div>
                            <p className="text-xs font-bold text-slate-800">Booking Confirmed</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">24 May 2025, 09:16 AM</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                            <p className="text-xs font-bold text-slate-400">Customer Arrived</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">-</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                            <p className="text-xs font-bold text-slate-400">Service Started</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">-</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                            <p className="text-xs font-bold text-slate-400">Service Completed</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">-</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
                            <span className="text-xl">⏱️</span>
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black">Estimated Duration</p>
                              <p className="text-xs font-bold text-blue-650 mt-0.5">60 mins</p>
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
                            <span className="text-xl">📅</span>
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black">Preferred Date & Time</p>
                              <p className="text-xs font-bold text-blue-655 mt-0.5">26 May 2025, 10:00 AM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Booking Overview */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <h3 className="text-sm font-black text-slate-800 tracking-wide mb-4">Booking Overview</h3>
                      <div className="space-y-3.5 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Booking ID</span>
                          <span className="text-blue-600 font-bold">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booking Date</span>
                          <span className="text-slate-800 font-bold">24 May 2025, 09:15 AM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booking Type</span>
                          <span className="px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] font-bold">Walk-in</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Status</span>
                          <span className="text-emerald-600 font-bold uppercase">{b.paymentStatus || 'Paid'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booking Status</span>
                          <span className="text-blue-600 font-bold uppercase">{b.status || 'Upcoming'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <h3 className="text-sm font-black text-slate-800 tracking-wide mb-4">Price Summary</h3>
                      <div className="space-y-3 text-xs text-slate-505">
                        <div className="flex justify-between">
                          <span>Service Amount</span>
                          <span className="text-slate-800">₹{b.totalAmount || '1,250'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount</span>
                          <span className="text-slate-800">₹0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span className="text-slate-800">₹0</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-100">
                          <span className="font-bold text-slate-800">Total Amount</span>
                          <span className="font-black text-blue-600 text-sm">₹{b.totalAmount || '1,250'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-1.5">
                        <span>📝</span> Notes
                      </h3>
                      <p className="text-xs text-slate-505 leading-relaxed font-medium">
                        Customer requested extra interior fragrance.
                      </p>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                      <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-1.5">
                        <span>📎</span> Attachments
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-all">
                          <span className="text-slate-600 font-medium">Vehicle Photo</span>
                          <button className="text-blue-650 hover:text-blue-600 font-bold flex items-center gap-1">👁️ View</button>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-all">
                          <span className="text-slate-600 font-medium">Damage Photo</span>
                          <button className="text-blue-650 hover:text-blue-600 font-bold flex items-center gap-1">👁️ View</button>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-all">
                          <span className="text-slate-600 font-medium">Invoice</span>
                          <button className="text-blue-655 hover:text-blue-600 font-bold flex items-center gap-1">👁️ View</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action controls */}
                <div className="flex flex-wrap gap-4 pt-5 border-t border-slate-200">
                  <button className="px-6 py-3 bg-white hover:bg-red-50 text-red-505 border border-red-200 hover:border-red-300 rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm">
                    Cancel Booking
                  </button>
                  <button className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 hover:border-amber-300 rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm">
                    Reschedule
                  </button>
                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <>
                      {b.status !== 'in_progress' ? (
                        <button 
                          onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black cursor-pointer transition-all ml-auto shadow-md"
                        >
                          Start Service
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer transition-all ml-auto shadow-md"
                        >
                          Complete Service
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === "bookings" && viewNewBooking && (
            <div className="space-y-6 text-slate-800 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 pb-10 max-w-5xl mx-auto">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewNewBooking(false)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-500 cursor-pointer transition-all bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
                >
                  ← Back to Bookings
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wide">New Booking</h2>
                <p className="text-xs text-slate-500 mt-1">Create a new service booking for your customer.</p>
              </div>

              {/* Section 1: Customer Details */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600 text-xs">👤</span> 1. Customer Details
                </h3>
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Customer *</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Search customer by name or mobile number..." 
                      value={newBookingCustomerSearch}
                      onChange={(e) => {
                        setNewBookingCustomerSearch(e.target.value);
                        const found = customersList.find(c => 
                          c.firstName?.toLowerCase().includes(e.target.value.toLowerCase()) || 
                          c.phone?.includes(e.target.value)
                        );
                        if (found) {
                          setSelectedCustomerForBooking(found);
                          // Auto select first vehicle of this customer
                          const veh = vehiclesList.find(v => v.customerId === found._id);
                          if (veh) setSelectedVehicleForBooking(veh);
                        }
                      }}
                      className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800"
                    />
                    <button 
                      onClick={() => setActiveTab("customers")}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      + Add New Customer
                    </button>
                  </div>

                  {selectedCustomerForBooking ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {selectedCustomerForBooking.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            {selectedCustomerForBooking.firstName} {selectedCustomerForBooking.lastName} 
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">VIP</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">📞 {selectedCustomerForBooking.phone} | {selectedCustomerForBooking.email || "No email"}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">📍 Noida, Uttar Pradesh</p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-slate-400">Total Bookings</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">24</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No customer selected. Type above to filter & select a customer.</div>
                  )}
                </div>
              </div>

              {/* Section 2: Vehicle Details */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600 text-xs">🚗</span> 2. Vehicle Details
                </h3>
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Vehicle *</label>
                  <div className="flex gap-3">
                    <select 
                      value={selectedVehicleForBooking?._id || ""}
                      onChange={(e) => {
                        const veh = vehiclesList.find(v => v._id === e.target.value);
                        if (veh) setSelectedVehicleForBooking(veh);
                      }}
                      className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 cursor-pointer"
                    >
                      <option value="">Select Vehicle</option>
                      {vehiclesList
                        .filter(v => !selectedCustomerForBooking || v.customerId === selectedCustomerForBooking._id)
                        .map(v => (
                          <option key={v._id} value={v._id}>
                            {v.brand} {v.model} ({v.plateNumber || v.vehicleNumber})
                          </option>
                        ))
                      }
                      {vehiclesList.length === 0 && <option value="Fortuner">Toyota Fortuner (UP 16 AB 1234)</option>}
                    </select>
                    <button 
                      onClick={() => setActiveTab("vehicles")}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      + Add New Vehicle
                    </button>
                  </div>

                  {selectedVehicleForBooking ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-lg border border-slate-100">🚗</div>
                      <div className="grid grid-cols-3 gap-6 text-[10px]">
                        <div>
                          <p className="text-slate-700 font-bold">{selectedVehicleForBooking.brand} {selectedVehicleForBooking.model}</p>
                          <p className="text-blue-600 font-bold mt-0.5">{selectedVehicleForBooking.plateNumber || selectedVehicleForBooking.vehicleNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold">Color</p>
                          <p className="text-slate-800 font-bold mt-0.5">{selectedVehicleForBooking.color || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold">Fuel Type</p>
                          <p className="text-slate-800 font-bold mt-0.5">{selectedVehicleForBooking.fuelType || "Diesel"}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-lg border border-slate-100">🚗</div>
                      <div className="grid grid-cols-3 gap-6 text-[10px]">
                        <div>
                          <p className="text-slate-700 font-bold">Toyota Fortuner</p>
                          <p className="text-blue-600 font-bold mt-0.5">UP 16 AB 1234</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold">Color</p>
                          <p className="text-slate-800 font-bold mt-0.5">White</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold">Fuel Type</p>
                          <p className="text-slate-800 font-bold mt-0.5">Diesel</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Service Package */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600 text-xs">📦</span> 3. Service Package
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Service Package *</label>
                  <select 
                    value={selectedServicePackage}
                    onChange={(e) => setSelectedServicePackage(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="Premium Steam Wash">Premium Steam Wash (₹1,250)</option>
                    <option value="Interior Cleaning">Interior Cleaning (₹850)</option>
                    <option value="Foam Wash">Foam Wash (₹650)</option>
                    <option value="Ceramic Coating">Ceramic Coating (₹3,500)</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Schedule Date & Time */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600 text-xs">📅</span> 4. Schedule Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block text-slate-550 font-semibold mb-2">Schedule Date *</label>
                    <input 
                      type="date" 
                      value={selectedBookingDate}
                      onChange={(e) => setSelectedBookingDate(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 font-semibold mb-2">Schedule Time *</label>
                    <select 
                      value={selectedBookingTime}
                      onChange={(e) => setSelectedBookingTime(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 cursor-pointer"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Select Services Checklist */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600 text-xs">🛒</span> 5. Select Services
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">Choose one or more services for this booking.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Exterior Wash', price: '₹300', icon: '🚗' },
                    { label: 'Interior Cleaning', price: '₹400', icon: '🧼' },
                    { label: 'Steam Wash', price: '₹500', icon: '💨' },
                    { label: 'Deep Cleaning', price: '₹700', icon: '✨' },
                  ].map((srv) => (
                    <div 
                      key={srv.label}
                      onClick={() => {
                        if (selectedServicesChecklist.includes(srv.label)) {
                          setSelectedServicesChecklist(selectedServicesChecklist.filter(x => x !== srv.label));
                        } else {
                          setSelectedServicesChecklist([...selectedServicesChecklist, srv.label]);
                        }
                      }}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedServicesChecklist.includes(srv.label)
                          ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xl">{srv.icon}</span>
                      <p className="text-xs font-bold">{srv.label}</p>
                      <span className={`text-[10px] font-bold ${selectedServicesChecklist.includes(srv.label) ? "text-blue-600" : "text-emerald-600"}`}>{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Additional Notes */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-3">6. Additional Notes (Optional)</h3>
                <textarea 
                  placeholder="Enter any special instructions or notes..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full h-24 rounded-xl bg-white border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800"
                />
              </div>

              {/* Booking Summary sticky bottom info */}
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500">Estimated Amount</p>
                  <p className="text-base font-black text-emerald-600 mt-1">
                    ₹{selectedServicePackage === "Premium Steam Wash" ? "1,250" : selectedServicePackage === "Interior Cleaning" ? "850" : selectedServicePackage === "Foam Wash" ? "650" : "3,500"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Selected Services</p>
                  <p className="text-xs text-slate-800 font-bold mt-1">1 Package</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="text-xs text-slate-800 font-bold mt-1">60 mins</p>
                </div>
              </div>

              <button 
                onClick={handleCreateBooking}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer text-center shadow-md"
              >
                Create Booking 🚀
              </button>
            </div>
          )}

          {activeTab === "bookings" && !selectedBookingId && !viewNewBooking && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100">
              {/* Header section with description */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Booking Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage and track all your bookings in one place.</p>
                </div>
                <button 
                  onClick={() => {
                    setViewNewBooking(true);
                    if (customersList.length > 0) {
                      setSelectedCustomerForBooking(customersList[0]);
                      const veh = vehiclesList.find(v => v.customerId === customersList[0]._id);
                      if (veh) setSelectedVehicleForBooking(veh);
                    }
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕</span> New Booking
                </button>
              </div>

              {/* Status Tab buttons with count badges */}
              <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl gap-2 shadow-sm">
                <button 
                  onClick={() => setBookingStatusFilter("upcoming")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    bookingStatusFilter === "upcoming" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>Upcoming</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-extrabold">
                    {bookings.filter(b => !['completed', 'cancelled', 'in_progress'].includes((b.status || "").toLowerCase())).length}
                  </span>
                </button>
                <button 
                  onClick={() => setBookingStatusFilter("ongoing")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    bookingStatusFilter === "ongoing" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>Ongoing</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-extrabold">
                    {bookings.filter(b => (b.status || "").toLowerCase() === 'in_progress').length}
                  </span>
                </button>
                <button 
                  onClick={() => setBookingStatusFilter("completed")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    bookingStatusFilter === "completed" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>Completed</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-extrabold">
                    {bookings.filter(b => (b.status || "").toLowerCase() === 'completed').length}
                  </span>
                </button>
                <button 
                  onClick={() => setBookingStatusFilter("cancelled")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    bookingStatusFilter === "cancelled" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>Cancelled</span>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-extrabold">
                    {bookings.filter(b => (b.status || "").toLowerCase() === 'cancelled').length}
                  </span>
                </button>
                <button 
                  onClick={() => setBookingStatusFilter("all")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ml-auto ${
                    bookingStatusFilter === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>All Bookings</span>
                </button>
              </div>

              {/* Filters & search panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[240px]">
                    <input
                      type="text"
                      placeholder="Search by Booking ID, Customer or Mobile..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  </div>

                  <input 
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer"
                  />

                  <select 
                    value={bookingServiceFilter}
                    onChange={(e) => setBookingServiceFilter(e.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer"
                  >
                    <option value="">Service Type</option>
                    <option value="Steam Car Wash">Steam Car Wash</option>
                    <option value="Premium Steam Wash">Premium Steam Wash</option>
                    <option value="Interior Cleaning">Interior Cleaning</option>
                    <option value="Foam Wash">Foam Wash</option>
                    <option value="Ceramic Coating">Ceramic Coating</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setBookingSearch("");
                      setBookingDateFilter("");
                      setBookingServiceFilter("");
                      setBookingStatusFilter("all");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-150 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Bookings rows list */}
              <div className="space-y-4">
                {bookings
                  .filter((b) => {
                    const bStatus = (b.status || "").toLowerCase();
                    // Status filter
                    if (bookingStatusFilter === "upcoming" && ['completed', 'cancelled', 'in_progress'].includes(bStatus)) return false;
                    if (bookingStatusFilter === "ongoing" && bStatus !== 'in_progress') return false;
                    if (bookingStatusFilter === "completed" && bStatus !== 'completed') return false;
                    if (bookingStatusFilter === "cancelled" && bStatus !== 'cancelled') return false;

                    // Text search
                    if (bookingSearch) {
                      const query = bookingSearch.toLowerCase();
                      const bId = (b.bookingId || "").toLowerCase();
                      const cust = (b.customerName || "").toLowerCase();
                      const phoneNo = (b.phone || "").toLowerCase();
                      if (!bId.includes(query) && !cust.includes(query) && !phoneNo.includes(query)) return false;
                    }

                    // Date filter
                    if (bookingDateFilter) {
                      const d1 = new Date(b.slotDate).toDateString();
                      const d2 = new Date(bookingDateFilter).toDateString();
                      if (d1 !== d2) return false;
                    }

                    // Service type filter
                    if (bookingServiceFilter) {
                      if ((b.serviceName || "").toLowerCase() !== bookingServiceFilter.toLowerCase()) return false;
                    }

                    return true;
                  })
                  .map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBookingId(b._id)}
                      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-500/25 hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-5 gap-5 items-center cursor-pointer shadow-sm"
                    >
                      {/* Col 1: Booking ID & Date */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booking ID</span>
                        <p className="text-sm font-black text-blue-600 mt-1">{b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</p>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-2">
                          <span>📅</span>
                          <span>{b.slotDate ? new Date(b.slotDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '26 May 2025'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 ml-5 font-medium">{b.slotTime || '10:00 AM'}</p>
                      </div>

                      {/* Col 2: Customer Details */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {String(b.customerName || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{b.customerName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">📞 {b.phone}</p>
                          <p className="text-[9px] text-slate-450 mt-1 flex items-center gap-0.5">
                            <span>📍</span> <span className="truncate max-w-[150px]" title={b.address}>{b.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Col 3: Vehicle Details */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-lg">
                          🚗
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Vehicle Details</span>
                          <p className="text-xs font-bold text-slate-800">{b.vehicleNumber}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{b.plateNumber} • {b.color}</p>
                        </div>
                      </div>

                      {/* Col 4: Service & Amount */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{b.serviceName || 'Steam Car Wash'}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-400">Amount</span>
                          <span className="text-xs font-black text-emerald-600">₹{(b.totalAmount || 1250).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Col 5: Status & Actions */}
                      <div className="flex flex-col md:items-end gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            (b.status || "").toLowerCase() === "completed"
                              ? "bg-emerald-550/10 text-emerald-600"
                              : (b.status || "").toLowerCase() === "cancelled"
                              ? "bg-rose-550/10 text-rose-600"
                              : (b.status || "").toLowerCase() === "in_progress"
                              ? "bg-indigo-550/10 text-indigo-600"
                              : "bg-blue-550/10 text-blue-600"
                          }`}>
                            {(b.status || 'Upcoming').replace("_", " ")}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            (b.paymentStatus || "").toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {(b.paymentStatus || 'Pending').toLowerCase() === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>

                        {!['completed', 'cancelled'].includes((b.status || "").toLowerCase()) && (
                          <div className="flex gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                            {(b.status || "").toLowerCase() !== 'in_progress' ? (
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                                disabled={actionLoading === b._id}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-blue-650 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                              >
                                Start Ongoing
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                                disabled={actionLoading === b._id}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-650 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
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
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No bookings found matching selected category.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "customers" && selectedCustomerId && (
            (() => {
              const c = (customersList || []).find(cust => cust._id === selectedCustomerId) || {
                _id: selectedCustomerId,
                name: 'Rahul Sharma',
                email: 'rahul.sh.99@email.com',
                phone: '+91 98765 43210',
                address: 'Sector 62, Noida, Uttar Pradesh - 201301',
                points: 760,
                tier: 'Gold',
                bookingsCount: 18,
                totalAmount: 28450,
                vehicle: 'Toyota Fortuner',
                plateNumber: 'UP 16 AB 1234'
              };

              // Look up all vehicles belonging to this customer
              const customerVehicles = (vehiclesList || []).filter(v => v?.customerId === c._id);
              const displayVehicles = customerVehicles.length > 0 ? customerVehicles : [
                { brand: 'Toyota', model: 'Fortuner', plateNumber: 'UP 16 AB 1234', color: 'White', year: '2021' },
                { brand: 'Honda', model: 'City', plateNumber: 'UP 14 CD 5678', color: 'Blue', year: '2019' }
              ];

              return (
                <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
                  {/* Back Nav */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedCustomerId(null)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-all bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm"
                    >
                      ← Back to Customer List
                    </button>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEditingCustomer(c)}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Edit Customer
                      </button>
                      <a 
                        href={`tel:${c.phone}`}
                        className="px-4 py-2 bg-emerald-650 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        📞 Call Customer
                      </a>
                    </div>
                  </div>

                  {/* Title Header */}
                  <div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      <span>Customer Management</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600">Customer Profile</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-wide">Customer Profile</h2>
                    <p className="text-xs text-slate-505 mt-1">Detailed insights and history of your customer.</p>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left details pane */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Card 1: Basic Info */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="flex gap-4 pb-4 border-b border-slate-100">
                          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                            {String(c.name || 'C').charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-800 flex items-center gap-2">
                              {c.name} 
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-650 rounded text-[9px] font-black uppercase tracking-wider">VIP</span>
                            </p>
                            <p className="text-xs text-slate-505 mt-1.5 flex items-center gap-1"><span>📞</span> {c.phone}</p>
                            <p className="text-xs text-slate-550 mt-0.5 flex items-center gap-1"><span>✉️</span> {c.email}</p>
                            <p className="text-xs text-slate-550 mt-1 flex items-center gap-1"><span>📍</span> {c.address || 'Sector 62, Noida, Uttar Pradesh - 201301'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 pt-4 text-xs text-slate-500">
                          <div>
                            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Customer Type</p>
                            <p className="text-slate-800 font-black mt-1">VIP Partner</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Registration Date</p>
                            <p className="text-slate-800 font-black mt-1">12 Jan 2024</p>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Vehicles List */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-black text-slate-800 tracking-wide">Vehicles ({displayVehicles.length})</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {displayVehicles.map((veh, idx) => (
                            <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 flex items-center gap-3 shadow-sm">
                              <span className="text-2xl">🚗</span>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{veh.brand} {veh.model || ""}</p>
                                <p className="text-[10px] text-blue-600 font-black mt-0.5">{veh.plateNumber}</p>
                                <p className="text-[9px] text-slate-455 mt-0.5">Color: {veh.color || 'White'} • Year: {veh.year || '2021'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 3: Recent Bookings */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-black text-slate-800 tracking-wide">Recent Bookings</h3>
                          <button 
                            onClick={() => {
                              setActiveTab("bookings");
                              setBookingSearch(c.name);
                              setBookingStatusFilter("all");
                            }}
                            className="text-xs text-blue-600 hover:text-blue-500 font-black cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                          >
                            View All Bookings
                          </button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { id: 'GMF12580', srv: 'Steam Car Wash', date: '24 May 2025', amt: '₹1,250', status: 'Completed' },
                            { id: 'GMF12345', srv: 'Interior Cleaning', date: '22 May 2025', amt: '₹850', status: 'Completed' },
                            { id: 'GMF12021', srv: 'Foam Wash', date: '15 May 2025', amt: '₹650', status: 'Completed' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-150 text-xs shadow-sm">
                              <div>
                                <p className="font-bold text-slate-800">{item.srv} ({item.id})</p>
                                <p className="text-[10px] text-slate-455 mt-0.5">Date: {item.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-emerald-650">{item.amt}</p>
                                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase tracking-wide mt-0.5 inline-block">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column pane */}
                    <div className="space-y-6">
                      {/* Customer Insights metrics */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 tracking-wide mb-4">Customer Insights</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-150 shadow-sm">
                            <span className="text-xl">💰</span>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lifetime Value</p>
                              <p className="text-base font-black text-emerald-655 mt-0.5">₹{(c.totalAmount || c.spent || 28450).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-150 shadow-sm">
                            <span className="text-xl">📊</span>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visit Frequency</p>
                              <p className="text-base font-black text-slate-800 mt-0.5">{(c.bookingsCount || c.visits || 18)} visits</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Loyalty & Rewards details */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 tracking-wide mb-4">Loyalty & Rewards</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loyalty Points</p>
                            <p className="text-base font-black text-blue-600 mt-1">{(c.points || 760)} Points</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Tier</p>
                            <p className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">⭐ {c.tier || 'Gold'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === "customers" && !selectedCustomerId && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Customer Management</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-600">Customer List</span>
              </div>

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Customer List</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage all your customers in one place.</p>
                </div>
                <button 
                  onClick={() => setViewNewBooking(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>➕</span> Add New Customer
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Customers</span>
                    <p className="text-3xl font-black text-slate-800 mt-2">{customersList.length}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <span>↑ 12.5%</span> <span className="text-slate-400 font-normal">vs last month</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold">
                    👥
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Repeat Customers</span>
                    <p className="text-3xl font-black text-slate-800 mt-2">
                      {customersList.filter(c => (c.bookingsCount || 0) > 1 || c.type === "Repeat").length}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <span>↑ 15.3%</span> <span className="text-slate-400 font-normal">vs last month</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl font-bold">
                    🔄
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">New Customers</span>
                    <p className="text-3xl font-black text-slate-800 mt-2">
                      {customersList.filter(c => (c.bookingsCount || 0) <= 1 && c.type !== "Repeat").length}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <span>↑ 8.7%</span> <span className="text-slate-400 font-normal">vs last month</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl font-bold">
                    👤
                  </div>
                </div>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by name or mobile number..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  </div>
                  
                  <select 
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer"
                  >
                    <option value="">All Vehicles</option>
                    <option value="Fortuner">Toyota Fortuner</option>
                    <option value="City">Honda City</option>
                    <option value="Creta">Hyundai Creta</option>
                    <option value="Thar">Mahindra Thar</option>
                  </select>

                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option>Last Visit</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2.5 bg-blue-600/5 hover:bg-blue-600/10 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    More Filters ⚙️
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600/5 hover:bg-blue-600/10 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                    Export 📤
                  </button>
                </div>
              </div>

              {/* Table rendering list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Customer</th>
                        <th className="py-4.5 px-4">Mobile</th>
                        <th className="py-4.5 px-4">Vehicle</th>
                        <th className="py-4.5 px-4">Last Visit</th>
                        <th className="py-4.5 px-4 text-center">Total Bookings</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {customersList
                        .filter((item) => {
                          const nameSearch = (item.name || "").toLowerCase();
                          const phSearch = (item.phone || "").toLowerCase();
                          const searchStr = customerSearch.toLowerCase();
                          if (customerSearch && !nameSearch.includes(searchStr) && !phSearch.includes(searchStr)) return false;
                          
                          if (vehicleFilter) {
                            const vehicleStr = (item.vehicle || "").toLowerCase();
                            if (!vehicleStr.includes(vehicleFilter.toLowerCase())) return false;
                          }
                          return true;
                        })
                        .map((item) => (
                          <tr 
                            key={item._id}
                            onClick={() => setSelectedCustomerId(item._id)}
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          >
                            <td className="py-4.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                  {String(item.name || 'C').charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    {item.name} 
                                    {item.isVip && (
                                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-wider">VIP</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{item.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4.5 px-4 text-xs font-medium text-slate-650">
                              {item.phone}
                            </td>
                            <td className="py-4.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-base">🚗</span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{item.vehicle}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{item.plateNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4.5 px-4">
                              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <span>📅</span>
                                <div>
                                  <p className="text-xs font-semibold text-slate-755">{item.lastVisitDate || '26 May 2025'}</p>
                                  <p className="text-[10px] text-slate-400">{item.lastVisitTime || '10:00 AM'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4.5 px-4 text-center">
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="text-xs font-black text-slate-800">{item.bookingsCount}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                                  item.type === "Repeat" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                }`}>
                                  {item.type || 'New'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setSelectedCustomerId(item._id)}
                                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  title="View Details"
                                >
                                  👁️ <span className="hidden lg:inline text-[10px]">View</span>
                                </button>
                                <a 
                                  href={`tel:${item.phone}`}
                                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                                  title="Call Customer"
                                >
                                  📞 <span className="hidden lg:inline text-[10px]">Call</span>
                                </a>
                                <button 
                                  onClick={() => setEditingCustomer(item)}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-150 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                  title="Edit Customer"
                                >
                                  ✏️ <span className="hidden lg:inline text-[10px]">Edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <p>Showing 1 to {customersList.length} of {customersList.length} customers</p>
                  <div className="flex items-center gap-1">
                    <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Previous</button>
                    <button className="p-1 px-2.5 bg-blue-600 text-white border border-blue-600 rounded-md font-extrabold shadow-sm">1</button>
                    <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">2</button>
                    <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">3</button>
                    <span className="px-1 text-slate-400">...</span>
                    <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">125</button>
                    <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Vehicle Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Vehicle List</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Vehicle Management</h2>
                  <p className="text-xs text-slate-505 mt-1">Manage all vehicles registered with your franchise.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>📤</span> Export
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>➕</span> Add Vehicle
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Vehicles</span>
                    <p className="text-2xl font-black text-slate-800 mt-1.5">128</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">All registered vehicles</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-lg">
                    🚙
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Vehicles</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">104</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Currently active</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg">
                    🟢
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inactive Vehicles</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">16</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Not used recently</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-lg">
                    🟡
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Month Added</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">8</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">New vehicles added</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-lg">
                    ✨
                  </div>
                </div>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by vehicle number, brand or model..."
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  </div>
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option value="">All Brands</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="mahindra">Mahindra</option>
                  </select>
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option value="">All Types</option>
                    <option value="suv">SUV</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                  </select>
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option value="">Status: All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <span>⚙️</span> Filters
                </button>
              </div>

              {/* Grid cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { plate: 'UP16AB1234', brand: 'Toyota Fortuner', type: 'SUV', color: 'White', status: 'Active', imgUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP14CD5678', brand: 'Honda City', type: 'Sedan', color: 'Blue', status: 'Active', imgUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP16EF9012', brand: 'Hyundai Creta', type: 'SUV', color: 'White', status: 'Active', imgUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP14GH3456', brand: 'Mahindra Thar', type: 'SUV', color: 'Black', status: 'Active', imgUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP16KL1122', brand: 'Skoda Slavia', type: 'Sedan', color: 'Silver', status: 'Active', imgUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP14MN7788', brand: 'Maruti Suzuki Swift', type: 'Hatchback', color: 'Red', status: 'Inactive', imgUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP16OP3344', brand: 'Volkswagen Virtus', type: 'Sedan', color: 'Blue', status: 'Inactive', imgUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=60&w=300' },
                  { plate: 'UP14QR5566', brand: 'Tata Altroz', type: 'Hatchback', color: 'White', status: 'Inactive', imgUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=60&w=300' },
                ]
                .filter(v => {
                  if (vehicleFilter) {
                    const searchStr = vehicleFilter.toLowerCase();
                    return v.brand.toLowerCase().includes(searchStr) || v.plate.toLowerCase().includes(searchStr);
                  }
                  return true;
                })
                .map((v, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-extrabold text-slate-800">{v.plate}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            v.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{v.status}</span>
                          <button className="text-slate-400 hover:text-slate-600 text-xs">⋮</button>
                        </div>
                      </div>

                      {/* Real vehicle image */}
                      <div className="h-28 w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden mb-4 shadow-sm flex items-center justify-center">
                        <img 
                          src={v.imgUrl} 
                          alt={v.brand} 
                          className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                        />
                      </div>

                      <p className="text-sm font-black text-slate-800">{v.brand}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-455 font-bold">
                        <span className="flex items-center gap-1">🚙 {v.type}</span>
                        <span className="flex items-center gap-1">⚪ {v.color}</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingVehicle(v); }}
                        className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedVehicleDetails(v); }}
                        className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Pagination */}
              <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex items-center justify-between text-xs text-slate-500 mt-6">
                <p>Showing 1 to 8 of 128 vehicles</p>
                <div className="flex items-center gap-1">
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">Previous</button>
                  <button className="p-1 px-2.5 bg-blue-600 text-white border border-blue-600 rounded-md font-extrabold shadow-sm">1</button>
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">2</button>
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">3</button>
                  <span className="px-1 text-slate-400">...</span>
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">16</button>
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">Next</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "staff" && selectedStaffId && (
            (() => {
              const staffProfiles: Record<string, any> = {
                'STF001': {
                  id: 'STF001',
                  name: 'Amit Verma',
                  role: 'Supervisor',
                  dep: 'Operations',
                  phone: '+91 98765 43210',
                  email: 'amit.verma@email.com',
                  experience: '5 Years',
                  rating: '4.7',
                  reviews: 28,
                  dob: '12 Aug 1993',
                  gender: 'Male',
                  address: 'Sector 62, Noida, Uttar Pradesh - 201301',
                  emergency: 'Pooja Verma (Wife) • +91 98765 43211',
                  blood: 'B+',
                  nationality: 'Indian',
                  aadhaar: 'XXXX XXXX 1234',
                  pan: 'ABCDE1234F',
                  joinDate: '15 Jan 2023',
                  reportingTo: 'Vikram Singh',
                  timing: '09:00 AM - 06:00 PM',
                  empType: 'Full Time',
                  salType: 'Monthly',
                  basicSalary: '₹20,000',
                  workingDays: '26 Days / Month',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                  skills: ['Team Management', 'Customer Handling', 'Quality Check', 'Car Wash Expert', 'Staff Training'],
                  attendanceOverview: { total: 26, present: 22, absent: 2, leave: 2, rate: '84.6' },
                  earnings: { month: '₹22,450', lastMonth: '₹21,000', year: '₹1,28,450', total: '₹2,85,650' },
                  jobs: [
                    { id: 'JOB12345', cust: 'Rahul Sharma', svc: 'Exterior Wash', veh: 'UP16AB1234', dt: '26 May 2025, 10:00 AM', status: 'Ongoing', badge: 'bg-blue-50 text-blue-600' },
                    { id: 'JOB12344', cust: 'Neha Gupta', svc: 'Interior Cleaning', veh: 'UP14CD5678', dt: '26 May 2025, 12:30 PM', status: 'Upcoming', badge: 'bg-amber-50 text-amber-600' },
                    { id: 'JOB12343', cust: 'Amitabh Singh', svc: 'Steam Wash', veh: 'UP16EF9012', dt: '27 May 2025, 11:00 AM', status: 'Upcoming', badge: 'bg-amber-50 text-amber-600' },
                    { id: 'JOB12342', cust: 'Vikram Patel', svc: 'Deep Cleaning', veh: 'UP14GH3456', dt: '27 May 2025, 02:30 PM', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                    { id: 'JOB12341', cust: 'Anjali Mehta', svc: 'Foam Wash', veh: 'UP16KL1122', dt: '25 May 2025, 09:30 AM', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                  ]
                },
                'STF002': {
                  id: 'STF002',
                  name: 'Rahul Sharma',
                  role: 'Technician',
                  dep: 'Cleaning',
                  phone: '+91 91234 56789',
                  email: 'rahul.sharma@email.com',
                  experience: '3 Years',
                  rating: '4.5',
                  reviews: 19,
                  dob: '05 Mar 1995',
                  gender: 'Male',
                  address: 'Sector 45, Noida, Uttar Pradesh - 201303',
                  emergency: 'Sushila Sharma (Mother) • +91 91234 56780',
                  blood: 'O+',
                  nationality: 'Indian',
                  aadhaar: 'XXXX XXXX 5678',
                  pan: 'FGHIJ5678K',
                  joinDate: '10 Feb 2024',
                  reportingTo: 'Amit Verma',
                  timing: '09:00 AM - 06:00 PM',
                  empType: 'Full Time',
                  salType: 'Monthly',
                  basicSalary: '₹15,000',
                  workingDays: '26 Days / Month',
                  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
                  skills: ['Exterior foam wash', 'Tyre & Rim cleaning', 'Vacuum cleaning', 'Car Wash Expert'],
                  attendanceOverview: { total: 26, present: 24, absent: 1, leave: 1, rate: '92.3' },
                  earnings: { month: '₹16,500', lastMonth: '₹15,200', year: '₹95,450', total: '₹1,95,650' },
                  jobs: [
                    { id: 'JOB12340', cust: 'Rohit Kumar', svc: 'Foam Wash', veh: 'UP16KL1122', dt: '25 May 2025, 11:30 AM', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' }
                  ]
                },
                'STF003': {
                  id: 'STF003',
                  name: 'Vikram Singh',
                  role: 'Cleaner',
                  dep: 'Cleaning',
                  phone: '+91 87654 32109',
                  email: 'vikram.singh@email.com',
                  experience: '2 Years',
                  rating: '4.2',
                  reviews: 12,
                  dob: '20 Jul 1997',
                  gender: 'Male',
                  address: 'Sector 12, Noida, Uttar Pradesh - 201301',
                  emergency: 'Karan Singh (Brother) • +91 87654 32100',
                  blood: 'A+',
                  nationality: 'Indian',
                  aadhaar: 'XXXX XXXX 9012',
                  pan: 'LMNOP9012Q',
                  joinDate: '01 Mar 2024',
                  reportingTo: 'Amit Verma',
                  timing: '09:00 AM - 06:00 PM',
                  empType: 'Full Time',
                  salType: 'Monthly',
                  basicSalary: '₹12,000',
                  workingDays: '26 Days / Month',
                  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
                  skills: ['Interior cleaning', 'Dashboard polishing', 'Helper'],
                  attendanceOverview: { total: 26, present: 20, absent: 4, leave: 2, rate: '76.9' },
                  earnings: { month: '₹13,100', lastMonth: '₹12,200', year: '₹75,450', total: '₹1,50,650' },
                  jobs: [
                    { id: 'JOB12339', cust: 'Karan Malhotra', svc: 'Interior Cleaning', veh: 'UP14CD5678', dt: '25 May 2025, 03:00 PM', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' }
                  ]
                }
              };

              const st = staffProfiles[selectedStaffId] || staffProfiles['STF001'];

              return (
                <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
                  {/* Breadcrumbs & Navigation Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span className="hover:text-slate-650 cursor-pointer" onClick={() => setSelectedStaffId(null)}>Staff Management</span>
                        <span className="text-slate-300">/</span>
                        <span className="hover:text-slate-650 cursor-pointer" onClick={() => setSelectedStaffId(null)}>Staff List</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">{st.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                        ✏️ Edit Profile
                      </button>
                      <button className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                        📞 Call Staff
                      </button>
                    </div>
                  </div>

                  {/* Profile Header Box */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Left Column: Avatar & Basic Contact */}
                    <div className="lg:col-span-2 flex gap-5 items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm flex items-center justify-center bg-slate-100">
                        <img 
                          src={st.avatarUrl} 
                          alt={st.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl font-black text-slate-900">{st.name}</h3>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase">Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800">{st.role}</span>
                          <span className="text-slate-300">|</span>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">{st.id}</span>
                        </div>
                        <p className="text-xs text-slate-455">📞 {st.phone}</p>
                        <p className="text-xs text-slate-455">✉️ {st.email}</p>
                        <p className="text-xs text-slate-455">📍 {st.address}</p>
                      </div>
                    </div>

                    {/* Middle Column: Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-l border-slate-100 pl-6">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                        <p className="text-slate-800 font-black mt-1">Operations</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Join Date</p>
                        <p className="text-slate-800 font-black mt-1">{st.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                        <p className="text-slate-800 font-black mt-1">{st.experience}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporting To</p>
                        <p className="text-slate-800 font-black mt-1">{st.reportingTo}</p>
                      </div>
                    </div>

                    {/* Right Column: Rating Circle */}
                    <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-6">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                          <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-yellow-500" strokeWidth="3" strokeDasharray="94, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <p className="text-base font-black text-slate-850">{st.rating}⭐</p>
                          <p className="text-[8px] text-slate-400 uppercase font-bold">Rating</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Based on {st.reviews} reviews</p>
                    </div>
                  </div>

                  {/* Sub-tabs Bar */}
                  <div className="flex border-b border-slate-200 text-xs font-bold text-slate-400">
                    <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 tracking-wide">Personal Info</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Attendance</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Earnings</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Documents</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Assigned Jobs</button>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Personal Information Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs text-slate-505">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Full Name</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Date of Birth</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.dob}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Gender</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Mobile Number</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.phone}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Email Address</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Address</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.address}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Emergency Contact</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.emergency}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.blood}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Nationality</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.nationality}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Aadhaar Number</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.aadhaar}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">PAN Number</p>
                            <p className="text-slate-850 font-bold mt-0.5">{st.pan}</p>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Overview Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Attendance Overview (This Month)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                          <div className="md:col-span-4 grid grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Total Days</span>
                              <p className="text-xl font-black text-slate-800 mt-1">{st.attendanceOverview.total}</p>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Present</span>
                              <p className="text-xl font-black text-emerald-600 mt-1">{st.attendanceOverview.present}</p>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Absent</span>
                              <p className="text-xl font-black text-rose-500 mt-1">{st.attendanceOverview.absent}</p>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">On Leave</span>
                              <p className="text-xl font-black text-amber-500 mt-1">{st.attendanceOverview.leave}</p>
                            </div>
                          </div>
                          
                          {/* Circle Progress Rate */}
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-emerald-500" strokeWidth="3" strokeDasharray={`${st.attendanceOverview.rate}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              </svg>
                              <div className="absolute">
                                <p className="text-xs font-black text-slate-800">{st.attendanceOverview.rate}%</p>
                              </div>
                            </div>
                            <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">Attendance</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column sidebar */}
                    <div className="space-y-6">
                      {/* Other Information Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-xs text-slate-500">
                        <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Other Information</h3>
                        <div className="space-y-3.5">
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Employee ID</span>
                            <span className="text-slate-850 font-bold">{st.id}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Designation</span>
                            <span className="text-slate-850 font-bold">{st.role}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Department</span>
                            <span className="text-slate-850 font-bold">{st.dep}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Shift Timing</span>
                            <span className="text-slate-850 font-bold">{st.timing}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Employment Type</span>
                            <span className="text-slate-850 font-bold">{st.empType}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Salary Type</span>
                            <span className="text-slate-850 font-bold">{st.salType}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Basic Salary</span>
                            <span className="text-emerald-600 font-black">{st.basicSalary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Working Days</span>
                            <span className="text-slate-850 font-bold">{st.workingDays}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-xs text-slate-500">
                        <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {st.skills.map((skill: string, sIdx: number) => (
                            <span key={sIdx} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-xl font-bold">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Summary Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Earnings Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">This Month</p>
                          <p className="text-lg font-black text-slate-855 mt-1">{st.earnings.month}</p>
                          <button className="text-[10px] text-blue-600 font-bold hover:text-blue-500 mt-2 block">View Details</button>
                        </div>
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Last Month</p>
                          <p className="text-lg font-black text-slate-855 mt-1">{st.earnings.lastMonth}</p>
                          <button className="text-[10px] text-blue-600 font-bold hover:text-blue-500 mt-2 block">View Details</button>
                        </div>
                        <span className="text-2xl">💵</span>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">This Year</p>
                          <p className="text-lg font-black text-slate-855 mt-1">{st.earnings.year}</p>
                          <button className="text-[10px] text-blue-600 font-bold hover:text-blue-500 mt-2 block">View Details</button>
                        </div>
                        <span className="text-2xl">📈</span>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Earnings</p>
                          <p className="text-lg font-black text-slate-855 mt-1">{st.earnings.total}</p>
                          <button className="text-[10px] text-blue-600 font-bold hover:text-blue-500 mt-2 block">View Details</button>
                        </div>
                        <span className="text-2xl">🏦</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Assigned Jobs Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-900 tracking-wide">Recent Assigned Jobs</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All Jobs</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                            <th className="pb-3 px-4">Job ID</th>
                            <th className="pb-3 px-4">Customer</th>
                            <th className="pb-3 px-4">Service</th>
                            <th className="pb-3 px-4">Vehicle</th>
                            <th className="pb-3 px-4">Date & Time</th>
                            <th className="pb-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {st.jobs.map((job: any, jIdx: number) => (
                            <tr key={jIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-blue-600">{job.id}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-800">{job.cust}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-650">{job.svc}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-700">{job.veh}</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">{job.dt}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${job.badge}`}>{job.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button className="w-full text-center py-2.5 mt-4 border-t border-slate-100 hover:bg-slate-50 text-[11px] text-blue-655 font-bold flex items-center justify-center gap-1">
                      Show More Jobs <span>∨</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === "staff" && !selectedStaffId && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Staff Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Staff List</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Staff Dashboard</h2>
                  <p className="text-xs text-slate-505 mt-1">Manage & monitor your staff and their activities.</p>
                </div>
                <button 
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2.5 bg-blue-655 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>➕</span> Add New Staff
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</span>
                    <p className="text-2xl font-black text-slate-800 mt-1.5">32</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">All registered staff</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-lg">
                    👥
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present Today</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">24</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">75.0% of total</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg">
                    🟢
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absent Today</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">5</p>
                    <p className="text-[10px] text-rose-500 font-semibold mt-0.5">15.6% of total</p>
                  </div>
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 text-lg">
                    🔴
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">On Leave</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">3</p>
                    <p className="text-[10px] text-amber-500 font-semibold mt-0.5">9.4% of total</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-lg">
                    🟡
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left columns: Staff List table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                  <h3 className="text-sm font-black text-slate-850 tracking-wide mb-4 pb-2 border-b border-slate-100">Staff List</h3>
                  <div className="space-y-3.5">
                    {[
                      { id: 'STF001', name: 'Amit Verma', role: 'Supervisor', dep: 'Operations', phone: '+91 98765 43210', status: 'Present' },
                      { id: 'STF002', name: 'Rahul Sharma', role: 'Technician', dep: 'Cleaning', phone: '+91 91234 56789', status: 'Present' },
                      { id: 'STF003', name: 'Vikram Singh', role: 'Cleaner', dep: 'Cleaning', phone: '+91 87654 32109', status: 'Absent' },
                    ].map((st, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedStaffId(st.id)}
                        className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs cursor-pointer hover:border-blue-200 hover:bg-white transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-1.5">{st.name} <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{st.id}</span></p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{st.role} • {st.dep}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 font-semibold">{st.phone}</p>
                          <span className={`text-[9px] font-black uppercase mt-1 inline-block ${st.status === 'Present' ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded'}`}>{st.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column sidebar */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                    <h3 className="text-sm font-black text-slate-850 tracking-wide mb-4 pb-2 border-b border-slate-100">Department wise count</h3>
                    <div className="space-y-3.5 text-xs text-slate-500">
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span>Operations</span>
                        <span className="text-slate-800 font-black">8</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span>Cleaning</span>
                        <span className="text-slate-800 font-black">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Detailing</span>
                        <span className="text-slate-800 font-black">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && viewPricingManagement && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewPricingManagement(false)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                >
                  ← Back to Service List
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Pricing Management</h2>
                <p className="text-xs text-slate-400 mt-1">Manage service pricing and offer prices.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Services</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">12</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Active Pricing</span>
                  <p className="text-3xl font-extrabold text-emerald-450 mt-1.5">12</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Services On Offer</span>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1.5">6</p>
                </div>
              </div>

              {/* Bulk Update Controls */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide">Bulk Price Update</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Update Type</label>
                    <select className="w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white cursor-pointer">
                      <option>Offer Price</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Update Value</label>
                    <input 
                      type="text" 
                      placeholder="Enter amount"
                      className="w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold cursor-pointer transition-all">
                      Apply to Selected
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Rows Table List */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3 text-center w-10">Select</th>
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Offer Price</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { name: 'Exterior Wash', cat: 'Wash', price: '₹299', offer: '₹249', status: 'Active' },
                      { name: 'Interior Cleaning', cat: 'Cleaning', price: '₹499', offer: '₹399', status: 'Active' },
                      { name: 'Steam Wash', cat: 'Wash', price: '₹699', offer: '₹599', status: 'Active' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 text-center">
                          <input type="checkbox" className="rounded bg-slate-900 border-slate-800 cursor-pointer" />
                        </td>
                        <td className="py-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 text-blue-450 font-bold">{item.cat}</td>
                        <td className="py-4 text-slate-400">{item.price}</td>
                        <td className="py-4 text-emerald-450 font-bold">{item.offer}</td>
                        <td className="py-4 text-emerald-400 font-bold">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "services" && !viewPricingManagement && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Service Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Service Management</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Service Management</h2>
                  <p className="text-xs text-slate-505 mt-1">Manage all your car wash and detailing services.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewPricingManagement(true)}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>⚙️</span> Pricing Management
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>➕</span> Add Service
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Services</span>
                    <p className="text-2xl font-black text-slate-800 mt-1.5">7</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">All services available</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-lg">
                    🧼
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Services</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">7</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Currently active</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg">
                    🟢
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inactive Services</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">0</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Currently inactive</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-lg">
                    🟡
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Categories</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">4</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Service categories</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-lg">
                    👥
                  </div>
                </div>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search services by name..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  </div>
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option value="">All Categories</option>
                    <option value="wash">Wash</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="detailing">Detailing</option>
                    <option value="coating">Coating</option>
                    <option value="engine">Engine</option>
                  </select>
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs cursor-pointer">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <span>⚙️</span> Filters
                </button>
              </div>

              {/* Table list rows */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Service Name</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4">Price (₹)</th>
                        <th className="py-4.5 px-4">Duration</th>
                        <th className="py-4.5 px-4">Status</th>
                        <th className="py-4.5 px-4">Description</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {servicesList.map((item, idx) => (
                        <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-slate-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${item.badge}`}>
                              {item.cat}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 font-black text-slate-800">₹{item.price}</td>
                          <td className="py-4.5 px-4 text-slate-500 font-semibold flex items-center gap-1 mt-3">
                            <span>⏱️</span> {item.dur}
                          </td>
                          <td className="py-4.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-slate-455 font-medium max-w-xs truncate">{item.desc}</td>
                          <td className="py-4.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingService(item); }}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg shadow-sm cursor-pointer"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (confirm('Are you sure you want to delete this service?')) {
                                    setServicesList(prev => prev.filter(s => s._id !== item._id));
                                  }
                                }}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-red-505 rounded-lg shadow-sm cursor-pointer"
                              >
                                🗑️
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedServiceDetails(item); }}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg shadow-sm cursor-pointer"
                              >
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex items-center justify-between text-xs text-slate-500 mt-6">
                <p>Showing 1 to 7 of 7 services</p>
                <div className="flex items-center gap-1">
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">Previous</button>
                  <button className="p-1 px-2.5 bg-blue-600 text-white border border-blue-600 rounded-md font-extrabold shadow-sm">1</button>
                  <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-650 hover:bg-slate-50 cursor-pointer">Next</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Attendance Management</h2>
                <p className="text-xs text-slate-400 mt-1">Mark and manage staff attendance with accuracy.</p>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Staff</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">32</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Present Today</span>
                  <p className="text-3xl font-extrabold text-emerald-455 mt-1.5">24</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Absent Today</span>
                  <p className="text-3xl font-extrabold text-rose-500 mt-1.5">5</p>
                </div>
              </div>

              {/* Mark Attendance section */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-blue-500/35 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-white font-bold">Manual Attendance</span>
                    <input type="radio" checked className="cursor-pointer" />
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-400">Selfie Attendance</span>
                    <input type="radio" className="cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center gap-2 border-l border-r border-slate-850 px-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">AV</div>
                  <p className="text-xs font-bold text-white mt-2">Attendance Marked</p>
                  <p className="text-[10px] text-slate-500">26 May 2025, 09:15 AM</p>
                </div>

                <div className="text-xs text-slate-400 space-y-3 pl-4">
                  <h4 className="font-bold text-white">Today's Attendance Summary</h4>
                  <div className="flex justify-between">
                    <span>Check In Time</span>
                    <span className="text-white font-semibold">09:15 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="text-white font-semibold">Sector 62, Noida</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="text-emerald-450 font-bold">Present</span>
                  </div>
                </div>
              </div>

              {/* Table details list */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Staff Member</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Check In</th>
                      <th className="pb-3">Check Out</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { name: 'Amit Verma', dep: 'Operations', role: 'Supervisor', checkin: '09:15 AM', checkout: '06:05 PM', status: 'Present' },
                      { name: 'Rahul Sharma', dep: 'Cleaning', role: 'Technician', checkin: '08:58 AM', checkout: '05:42 PM', status: 'Present' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 text-slate-400">{item.dep}</td>
                        <td className="py-4 text-slate-400">{item.role}</td>
                        <td className="py-4 text-emerald-450 font-semibold">{item.checkin}</td>
                        <td className="py-4 text-slate-400">{item.checkout}</td>
                        <td className="py-4 text-emerald-400 font-bold">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "inventory" && viewInventoryDashboard && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Inventory Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Overview of your inventory status and stock summary.</p>
                </div>
                <button 
                  onClick={() => setViewInventoryDashboard(false)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  View Inventory List 📋
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Items</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">248</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Low Stock Items</span>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1.5">18</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Orders</span>
                  <p className="text-3xl font-extrabold text-blue-400 mt-1.5">12</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Value</span>
                  <p className="text-3xl font-extrabold text-emerald-450 mt-1.5">₹2,45,680</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock distribution charts */}
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Stock Overview</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">🟢 In Stock</span>
                      <span className="text-white font-bold">196 (79.0%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">🟡 Low Stock</span>
                      <span className="text-white font-bold">18 (7.3%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">🔴 Out of Stock</span>
                      <span className="text-white font-bold">6 (2.4%)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Alerts pane */}
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Stock Alert</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Car Shampoo</span>
                      <span className="text-rose-500 font-bold">3 left (Min: 10)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Microfiber Cloth</span>
                      <span className="text-rose-500 font-bold">5 left (Min: 15)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && selectedItemId && (
            (() => {
              const item = {
                id: selectedItemId,
                name: 'Car Shampoo',
                sku: 'ITM-001',
                cat: 'Cleaning',
                unit: 'Litre',
                location: 'Main Store',
                stock: 120,
                minStock: 20,
                onOrder: 30,
                desc: 'Premium quality car shampoo for exterior wash. Safe for all types of car paint.'
              };

              return (
                <div className="space-y-6 text-slate-100 pb-10">
                  {/* Header bar */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedItemId(null)}
                      className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                    >
                      ← Back to Inventory List
                    </button>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold cursor-pointer">
                        Edit Item
                      </button>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer">
                        Print / Export
                      </button>
                    </div>
                  </div>

                  {/* Split details layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-450 rounded-full text-[9px] font-bold uppercase">In Stock</span>
                        <h3 className="text-base font-black text-white mt-2">{item.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                        <div>
                          <p>SKU</p>
                          <p className="text-white font-bold mt-1">{item.sku}</p>
                        </div>
                        <div>
                          <p>Category</p>
                          <p className="text-white font-bold mt-1">{item.cat}</p>
                        </div>
                        <div>
                          <p>Location</p>
                          <p className="text-white font-bold mt-1">{item.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-4">
                      <h3 className="text-sm font-bold text-white tracking-wide">Stock Overview</h3>
                      <div className="flex justify-between">
                        <span>Current Stock</span>
                        <span className="text-white font-bold">{item.stock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Stock</span>
                        <span className="text-white font-bold">{item.minStock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Order</span>
                        <span className="text-blue-450 font-bold">{item.onOrder} {item.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === "inventory" && !selectedItemId && !viewInventoryDashboard && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Inventory List</h2>
                  <p className="text-xs text-slate-400 mt-1">View and manage all inventory items in your stock.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewInventoryDashboard(true)}
                    className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-350 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Inventory Dashboard 📊
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    + Add New Item
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Items</span>
                  <p className="text-2xl font-extrabold text-white mt-1">52</p>
                </div>
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Low Stock Items</span>
                  <p className="text-2xl font-extrabold text-amber-500 mt-1">7</p>
                </div>
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Value</span>
                  <p className="text-xl font-black text-emerald-450 mt-1.5">₹2,45,680</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <input 
                    type="text" 
                    placeholder="Search items by name, SKU..."
                    className="rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-550 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs min-w-[240px]"
                  />
                  <select className="rounded-xl bg-slate-900 border border-slate-800 text-white py-2 px-4 text-xs cursor-pointer">
                    <option>All Categories</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700/60 rounded-xl text-xs text-slate-350">
                  Export 📤
                </button>
              </div>

              {/* List grid */}
              <div className="space-y-4">
                {[
                  { id: 'ITM-001', name: 'Car Shampoo', desc: 'Premium car shampoo', stock: 120, unit: 'Litre', status: 'In Stock' },
                  { id: 'ITM-002', name: 'Cloth', desc: 'Microfiber cloth', stock: 85, unit: 'Pcs', status: 'In Stock' },
                  { id: 'ITM-003', name: 'Wax', desc: 'Car polish wax', stock: 40, unit: 'Pcs', status: 'In Stock' },
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-600/30 hover:bg-[#1E293B]/90 transition-all grid grid-cols-1 md:grid-cols-5 gap-5 items-center cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-550 mt-0.5">{item.desc}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">SKU: {item.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white font-bold">{item.stock} {item.unit}</p>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 rounded-full text-[9px] font-bold uppercase">{item.status}</span>
                    </div>
                    <div className="text-right flex gap-2 justify-end">
                      <button className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold">Issue</button>
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold">Receive</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Earnings Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Overview of your earnings and business performance.</p>
                </div>
                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Download Report 📥
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Today's Earnings</span>
                  <p className="text-2xl font-black text-white mt-1">₹24,560</p>
                  <p className="text-[9px] text-emerald-450 mt-1">↑ 12.5% vs yesterday</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Weekly Earnings</span>
                  <p className="text-2xl font-black text-white mt-1">₹1,72,450</p>
                  <p className="text-[9px] text-emerald-450 mt-1">↑ 18.7% vs last week</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Earnings</span>
                  <p className="text-2xl font-black text-white mt-1">₹7,45,230</p>
                  <p className="text-[9px] text-emerald-450 mt-1">↑ 22.3% vs last month</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Net Profit</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">₹4,28,310</p>
                  <p className="text-[9px] text-emerald-450 mt-1">↑ 19.4% vs last month</p>
                </div>
              </div>

              {/* Earnings Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Earnings Overview</h3>
                  <div className="h-48 bg-slate-900/40 rounded-xl border border-slate-850 flex items-center justify-center text-slate-500 text-xs">
                    Earnings Analytics Chart Area
                  </div>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Earnings by Service Category</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exterior Wash</span>
                      <span className="text-white font-bold">₹2,45,670 (32.9%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interior Cleaning</span>
                      <span className="text-white font-bold">₹1,65,430 (22.2%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Wallet Balance</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage your wallet balance, withdraw funds and track settlements.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Wallet Settings
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    + Withdraw
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Current Balance</span>
                  <p className="text-2xl font-black text-white mt-1">₹1,24,560.00</p>
                  <p className="text-[9px] text-emerald-450 mt-1">↑ 12.6% vs last month</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Earnings</span>
                  <p className="text-2xl font-black text-white mt-1">₹7,45,230.00</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Withdrawn</span>
                  <p className="text-2xl font-black text-white mt-1">₹5,80,670.00</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Settlement</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">₹75,430.00</p>
                </div>
              </div>

              {/* Split Settlement History Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Settlement History</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'SET-2025-0526-001', date: '26 May 2025', amt: '₹85,430.00', status: 'Pending' },
                      { id: 'SET-2025-0519-002', date: '19 May 2025', amt: '₹92,650.00', status: 'Completed' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-slate-850/60 text-xs">
                        <div>
                          <p className="font-bold text-white">{item.id}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Date: {item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white">{item.amt}</p>
                          <span className={`text-[9px] font-bold uppercase ${item.status === 'Completed' ? 'text-emerald-455' : 'text-amber-500'}`}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">Wallet Summary</h3>
                  <div className="flex justify-between">
                    <span>Current Balance</span>
                    <span className="text-white font-bold">₹1,24,560.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdraw Limit</span>
                    <span className="text-white font-bold">₹1,24,560.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Transactions</h2>
                  <p className="text-xs text-slate-400 mt-1">View all payment transactions and their current status.</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold cursor-pointer">
                  Export 📤
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Transactions</span>
                  <p className="text-2xl font-black text-white mt-1">1,248</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Successful Transactions</span>
                  <p className="text-2xl font-black text-emerald-450 mt-1">1,068</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Transactions</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">112</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Failed Transactions</span>
                  <p className="text-2xl font-black text-rose-500 mt-1">68</p>
                </div>
              </div>

              {/* Transactions list row cards */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Mode</th>
                      <th className="pb-3">Date & Time</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { id: 'TRX-2025-0526-001', cust: 'Rahul Sharma', amt: '₹1,250.00', mode: 'UPI', date: '26 May 2025, 10:35 AM', status: 'Success' },
                      { id: 'TRX-2025-0526-002', cust: 'Priya Verma', amt: '₹2,800.00', mode: 'Credit Card', date: '26 May 2025, 09:20 AM', status: 'Success' },
                      { id: 'TRX-2025-0525-018', cust: 'Amit Gupta', amt: '₹950.00', mode: 'UPI', date: '25 May 2025, 08:45 PM', status: 'Pending' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-blue-500">{item.id}</td>
                        <td className="py-4 font-bold text-white">{item.cust}</td>
                        <td className="py-4 font-black text-white">{item.amt}</td>
                        <td className="py-4 text-slate-450">{item.mode}</td>
                        <td className="py-4 text-slate-400">{item.date}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'Success' ? 'text-emerald-400' : item.status === 'Pending' ? 'text-amber-400' : 'text-rose-500'
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Invoice Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage and track all your invoices in one place.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold cursor-pointer">
                    Export Invoices 📤
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer">
                    + Create Invoice
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Invoices</span>
                  <p className="text-2xl font-extrabold text-white mt-1">1,248</p>
                </div>
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Paid Invoices</span>
                  <p className="text-2xl font-extrabold text-emerald-450 mt-1">952</p>
                </div>
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Invoices</span>
                  <p className="text-2xl font-extrabold text-amber-500 mt-1">241</p>
                </div>
                <div className="bg-[#1E293B]/70 p-4 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-550 uppercase font-bold">Overdue Invoices</span>
                  <p className="text-2xl font-extrabold text-rose-500 mt-1">55</p>
                </div>
              </div>

              {/* Table details list */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Invoice Number</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Invoice Date</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { id: 'INV-2025-0526-001', cust: 'Rahul Sharma', date: '26 May 2025', due: '02 Jun 2025', amt: '₹2,450.00', status: 'Paid' },
                      { id: 'INV-2025-0526-002', cust: 'Priya Verma', date: '26 May 2025', due: '02 Jun 2025', amt: '₹4,750.00', status: 'Paid' },
                      { id: 'INV-2025-0525-018', cust: 'Amit Gupta', date: '25 May 2025', due: '01 Jun 2025', amt: '₹850.00', status: 'Pending' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-blue-500">{item.id}</td>
                        <td className="py-4 font-bold text-white">{item.cust}</td>
                        <td className="py-4 text-slate-400">{item.date}</td>
                        <td className="py-4 text-slate-400">{item.due}</td>
                        <td className="py-4 font-black text-white">{item.amt}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "offers" && viewCouponManagement && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewCouponManagement(false)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                >
                  ← Back to Offers Dashboard
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Coupon Management</h2>
                <p className="text-xs text-slate-400 mt-1">Create, manage and track all your coupons.</p>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Coupons</span>
                  <p className="text-2xl font-black text-white mt-1">56</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Active Coupons</span>
                  <p className="text-2xl font-black text-emerald-450 mt-1">34</p>
                </div>
              </div>

              {/* Table details list */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Coupon Name</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Min. Order</th>
                      <th className="pb-3">Expiry Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { code: 'SUMMER100', name: 'Summer Special 100', disc: '₹100', min: '₹499', exp: '31 May 2025', status: 'Active' },
                      { code: 'WEEKEND20', name: 'Weekend 20% OFF', disc: '20%', min: '₹300', exp: '25 May 2025', status: 'Expired' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-blue-500">{item.code}</td>
                        <td className="py-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 text-emerald-450 font-bold">{item.disc}</td>
                        <td className="py-4 text-slate-400">{item.min}</td>
                        <td className="py-4 text-slate-400">{item.exp}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'Active' ? 'text-emerald-400' : 'text-rose-500'
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "offers" && !viewCouponManagement && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Offers Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Create, manage and track all offers and promotions.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewCouponManagement(true)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Coupon Management 🎫
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-555 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    + Create Offer
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Offers</span>
                  <p className="text-2xl font-black text-white mt-1">32</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Active Offers</span>
                  <p className="text-2xl font-black text-emerald-450 mt-1">18</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Scheduled Offers</span>
                  <p className="text-2xl font-black text-blue-450 mt-1">7</p>
                </div>
              </div>

              {/* Table details list */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Offer Name</th>
                      <th className="pb-3">Offer Type</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Target</th>
                      <th className="pb-3">Validity</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { name: 'Summer Special Flat 100', type: 'Flat Discount', disc: '₹100', target: 'All Services', val: '20 May 2025 - 31 May 2025', status: 'Active' },
                      { name: 'Weekend 20% OFF', type: 'Percentage Discount', disc: '20%', target: 'Exterior Wash', val: '23 May 2025 - 25 May 2025', status: 'Active' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 text-blue-450 font-bold">{item.type}</td>
                        <td className="py-4 text-emerald-455 font-bold">{item.disc}</td>
                        <td className="py-4 text-slate-400">{item.target}</td>
                        <td className="py-4 text-slate-400">{item.val}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'Active' ? 'text-emerald-400' : 'text-rose-500'
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Ratings Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Track your overall ratings, reviews and customer feedback.</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 rounded-xl text-xs font-bold cursor-pointer">
                  Export Report 📤
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Average Rating</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">⭐ 4.6</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Reviews</span>
                  <p className="text-2xl font-black text-white mt-1">1,248</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reviews Feed list */}
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-4">Customer Reviews Feed</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Rahul Sharma', rating: '5.0', date: '26 May 2025', comment: 'Excellent service! My car was cleaned perfectly.' },
                      { name: 'Priya Verma', rating: '4.5', date: '25 May 2025', comment: 'Good service and friendly staff. Will definitely come again.' },
                    ].map((st, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-850/60 text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-white">{st.name}</p>
                          <span className="text-amber-500 font-bold">⭐ {st.rating}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{st.date}</p>
                        <p className="text-slate-400 mt-2">{st.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">Ratings Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>5 Star</span>
                      <span className="text-white font-bold">742 (59.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 Star</span>
                      <span className="text-white font-bold">312 (25.0%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Complaint Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Track and manage all complaints raised by customers.</p>
                </div>
                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer">
                  + Raise New Complaint
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Complaints</span>
                  <p className="text-2xl font-black text-white mt-1">325</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Open Complaints</span>
                  <p className="text-2xl font-black text-rose-500 mt-1">86</p>
                </div>
                <div className="bg-[#1E293B]/70 p-5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Complaints</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">112</p>
                </div>
              </div>

              {/* Table details list */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Complaint ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { id: 'CMP-2025-0526-001', cust: 'Rahul Sharma', cat: 'Customer', sub: 'Poor service experience', status: 'Open', priority: 'High' },
                      { id: 'CMP-2025-0526-002', cust: 'Priya Verma', cat: 'Payment', sub: 'Payment not refunded', status: 'Pending', priority: 'Medium' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 font-bold text-blue-500">{item.id}</td>
                        <td className="py-4 font-bold text-white">{item.cust}</td>
                        <td className="py-4 text-blue-450 font-bold">{item.cat}</td>
                        <td className="py-4 text-slate-400">{item.sub}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'Open' ? 'text-rose-500' : 'text-amber-400'
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.priority === 'High' ? 'text-red-500' : 'text-yellow-500'
                          }`}>{item.priority}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Support Tickets Section */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-white tracking-wide">My Support Tickets</h3>
                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">#TKT-2025-0578</span>
                      <span className="text-rose-500 font-bold uppercase text-[9px]">Open</span>
                    </div>
                    <p className="text-[10px] text-slate-550 mt-0.5">Payment not refunded</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business_profile" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Franchise Profile Dashboard</h2>
                  <p className="text-xs text-slate-450 mt-1">Overview of your franchise business information and status.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Edit Profile
                </button>
              </div>

              {/* Profile split summary layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center text-blue-400 text-xl font-bold">RM</div>
                  <div>
                    <h3 className="text-base font-black text-white">Roy Motors</h3>
                    <p className="text-[10px] text-blue-450 font-bold">GMF12345</p>
                    <p className="text-[10px] text-slate-500 mt-1">📍 Sector 45, Noida, Uttar Pradesh</p>
                  </div>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-550 uppercase">Membership Status</span>
                  <p className="text-sm font-bold text-white mt-1.5">Premium Member</p>
                  <p className="text-[9px] text-emerald-455 mt-0.5">Valid till: 15 Feb 2026</p>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs text-center">
                  <span className="text-[10px] text-slate-550 uppercase">Franchise Rating</span>
                  <p className="text-xl font-black text-amber-500 mt-1.5">⭐ 4.6</p>
                  <p className="text-[9px] text-slate-550 mt-0.5">128 Reviews</p>
                </div>
              </div>

              {/* Franchise Details Table lists */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-white">Franchise Overview</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Franchise Name</span>
                    <span className="text-white font-semibold">Roy Motors</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Established On</span>
                    <span className="text-white font-semibold">10 Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Number of Staff</span>
                    <span className="text-white font-semibold">18</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white">Documents KYC Status</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">GST Certificate</span>
                    <span className="text-emerald-455 font-bold uppercase text-[9px]">Verified</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bank Details</span>
                    <span className="text-emerald-455 font-bold uppercase text-[9px]">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6 text-slate-100 pb-10">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Profile & Account</h2>
                <p className="text-xs text-slate-400 mt-1">Manage your personal information, documents and account settings.</p>
              </div>

              {/* Sub tabs list row */}
              <div className="flex gap-4 border-b border-slate-800 pb-3 text-xs font-bold text-slate-450">
                <span className="text-blue-500 border-b-2 border-blue-500 pb-3.5 cursor-pointer">👤 Personal Details</span>
                <span className="cursor-pointer hover:text-slate-200">🏦 Bank Details</span>
                <span className="cursor-pointer hover:text-slate-200">📁 Documents</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information form fields */}
                <div className="lg:col-span-2 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 space-y-4 text-xs">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                    <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-blue-400 font-bold text-base">RM</div>
                    <div>
                      <p className="font-bold text-white">Profile Picture</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG or WEBP. Max size of 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Full Name *</label>
                      <input type="text" defaultValue="Roy Motors" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Email Address *</label>
                      <input type="email" defaultValue="roymotors@gmail.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Mobile Number *</label>
                      <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Nationality</label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white">
                        <option>Indian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Address *</label>
                    <textarea defaultValue="123, Green Park Avenue, Sector 45, Noida, Uttar Pradesh - 201301" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                  </div>

                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold cursor-pointer transition-all">Save Changes</button>
                </div>

                <div className="space-y-6">
                  {/* Account overview values list */}
                  <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-wide">Account Overview</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Account Type</span>
                        <span className="text-white font-semibold">Franchise</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Franchise ID</span>
                        <span className="text-white font-semibold">GMF12345</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Status</span>
                        <span className="text-emerald-450 font-bold uppercase text-[10px]">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 text-slate-100 pb-10">
              {/* Title Header */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Security Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Manage your account security and keep your data safe.</p>
              </div>

              {/* Password Change forms & input sections */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 text-xs space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold transition-all cursor-pointer">
                  Change Password
                </button>
              </div>

              {/* Toggles settings options layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">Biometric Login</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Fingerprint Login</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Login quickly using fingerprint sensor.</p>
                    </div>
                    <span className="text-blue-550 font-bold uppercase text-[10px]">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                    <div>
                      <p className="font-bold text-white">Face ID Login</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Login using face recognition.</p>
                    </div>
                    <span className="text-blue-550 font-bold uppercase text-[10px]">Enabled</span>
                  </div>
                </div>

                <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">Two-Factor Authentication (2FA)</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">2FA Authentication</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Add an extra layer of security to your account.</p>
                    </div>
                    <span className="text-emerald-450 font-bold uppercase text-[10px]">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Sessions Management devices table */}
              <div className="bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto text-xs">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4">Session Management</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Device</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">IP Address</th>
                      <th className="pb-3">Last Active</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    <tr className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 font-bold text-white">Windows • Chrome</td>
                      <td className="py-4 text-slate-400">Noida, India</td>
                      <td className="py-4 text-slate-400">103.21.45.78</td>
                      <td className="py-4 text-slate-450">Just now</td>
                      <td className="py-4 text-emerald-450 font-bold">Active</td>
                    </tr>
                    <tr className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 font-bold text-white">Android • Mobile App</td>
                      <td className="py-4 text-slate-400">Ghaziabad, India</td>
                      <td className="py-4 text-slate-400">103.21.45.91</td>
                      <td className="py-4 text-slate-450">2 hours ago</td>
                      <td className="py-4 text-emerald-450 font-bold">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicleDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800 relative">
            <button 
              onClick={() => setSelectedVehicleDetails(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚗</span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-wide">{selectedVehicleDetails.brand}</h3>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black">{selectedVehicleDetails.plate}</span>
              </div>
            </div>
            
            <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-sm">
              <img 
                src={selectedVehicleDetails.imgUrl} 
                alt={selectedVehicleDetails.brand}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Vehicle Type</span>
                <span className="text-slate-800 font-bold">{selectedVehicleDetails.type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Body Color</span>
                <span className="text-slate-800 font-bold">{selectedVehicleDetails.color}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Status</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  selectedVehicleDetails.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>{selectedVehicleDetails.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Owner Link</span>
                <span className="text-blue-600 font-bold">Rahul Sharma (VIP)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Preferred Workshop</span>
                <span className="text-slate-800 font-medium">Noida Sector 62</span>
              </div>
            </div>

            <div className="flex gap-3 pt-5 mt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedVehicleDetails(null);
                  setEditingVehicle(selectedVehicleDetails);
                }}
                className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
              >
                ✏️ Edit Vehicle
              </button>
              <button
                onClick={() => setSelectedVehicleDetails(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800 relative">
            <button 
              onClick={() => setSelectedServiceDetails(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-10 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                <img src={selectedServiceDetails.img} alt={selectedServiceDetails.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-wide">{selectedServiceDetails.name}</h3>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${selectedServiceDetails.badge}`}>{selectedServiceDetails.cat}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs mt-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Price</span>
                <span className="text-slate-800 font-black">₹{selectedServiceDetails.price}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Duration</span>
                <span className="text-slate-800 font-bold">⏱️ {selectedServiceDetails.dur}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Status</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase">{selectedServiceDetails.status}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Description</span>
                <span className="text-slate-700 font-medium leading-relaxed">{selectedServiceDetails.desc}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-5 mt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedServiceDetails(null);
                  setEditingService(selectedServiceDetails);
                }}
                className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
              >
                ✏️ Edit Service
              </button>
              <button
                onClick={() => setSelectedServiceDetails(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800">
            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-wide">Edit Service Details</h3>
            <form onSubmit={handleEditServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ""}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select
                  value={editingService.cat || "Wash"}
                  onChange={(e) => setEditingService({ ...editingService, cat: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Wash">Wash</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Detailing">Detailing</option>
                  <option value="Coating">Coating</option>
                  <option value="Engine">Engine</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={editingService.price || 0}
                  onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</label>
                <input
                  type="text"
                  required
                  value={editingService.dur || ""}
                  onChange={(e) => setEditingService({ ...editingService, dur: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  value={editingService.status || "Active"}
                  onChange={(e) => setEditingService({ ...editingService, status: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={editingService.desc || ""}
                  onChange={(e) => setEditingService({ ...editingService, desc: e.target.value })}
                  rows={2}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800">
            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-wide">Edit Vehicle Details</h3>
            <form onSubmit={handleEditVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand & Model</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.brand || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate Number</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.plate || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Type</label>
                <select
                  value={editingVehicle.type || "SUV"}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body Color</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.color || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  value={editingVehicle.status || "Active"}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, status: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800">
            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-wide">Edit Customer Details</h3>
            <form onSubmit={handleEditCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.phone || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingCustomer.email || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
                <textarea
                  value={editingCustomer.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  rows={2}
                  className="mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

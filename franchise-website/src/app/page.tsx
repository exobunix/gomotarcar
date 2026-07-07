"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// ----------------------------------------------------
// Core API Config & State Management (simulating Redux)
// ----------------------------------------------------
const API_BASE = typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127.0.0.1")
  ? "https://api.gomotarcar.com/api/v1"
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
  const [profileSubTab, setProfileSubTab] = useState<"dashboard" | "details" | "working_hours" | "gallery">("dashboard");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "security" | "notifications" | "language" | "theme" | "payment" | "printer">("general");
  const [profileSection, setProfileSection] = useState<"personal" | "bank" | "documents" | "password">("personal");
  // Profile Form States
  const [personalName, setPersonalName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalDob, setPersonalDob] = useState("15 Aug 1990");
  const [personalGender, setPersonalGender] = useState("Male");
  const [personalAddress, setPersonalAddress] = useState("");
  const [personalCity, setPersonalCity] = useState("");
  const [personalState, setPersonalState] = useState("");
  const [personalPincode, setPersonalPincode] = useState("");
  
  const [bankName, setBankName] = useState("HDFC Bank");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [documentsList, setDocumentsList] = useState<any[]>([
    { type: 'PAN Card', file: 'PAN_RoyMotors.pdf', size: '142 KB', status: 'verified' },
    { type: 'GST Certificate', file: 'GST_Certificate.pdf', size: '245 KB', status: 'verified' },
    { type: 'Address Proof (Electricity Bill)', file: 'Electricity_Bill.pdf', size: '320 KB', status: 'verified' },
    { type: 'Bank Details (Cancelled Cheque)', file: 'Cancelled_Cheque.pdf', size: '180 KB', status: 'verified' }
  ]);

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
  const [viewInventoryDashboard, setViewInventoryDashboard] = useState(true);
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

  
  // Synchronize input fields with fetched profile
  useEffect(() => {
    if (profile) {
      setPersonalName(profile.franchiseName || "");
      setPersonalEmail(profile.email || "");
      setPersonalPhone(profile.phone || "");
      setPersonalAddress(profile.address?.street || "");
      setPersonalCity(profile.address?.city || "");
      setPersonalState(profile.address?.state || "");
      setPersonalPincode(profile.address?.pincode || "");
      
      setBankName(profile.bankDetails?.bankName || "HDFC Bank");
      setBankAccountHolder(profile.bankDetails?.accountHolder || "");
      setBankAccountNumber(profile.bankDetails?.accountNumber || "");
      setBankIfscCode(profile.bankDetails?.ifscCode || "");
      setUploadedLogo(profile.logo || null);

      if (profile.documents && profile.documents.length > 0) {
        setDocumentsList(profile.documents.map((d: any) => ({
          _id: d._id,
          type: d.type || "Document",
          file: d.fileUrl || "file.pdf",
          size: "250 KB",
          status: d.status || "pending"
        })));
      }
    }
  }, [profile]);

  const handleSavePersonalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id) return;
    try {
      const res = await api.put(`/franchise/${profile._id}`, {
        franchiseName: personalName,
        email: personalEmail,
        phone: personalPhone.replace(/\s+/g, ''),
        address: {
          street: personalAddress,
          city: personalCity,
          state: personalState,
          pincode: personalPincode
        }
      });
      if (res.data?.success || res.data) {
        alert("Personal details saved successfully!");
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to save personal details: " + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id) return;
    try {
      const res = await api.put(`/franchise/${profile._id}`, {
        bankDetails: {
          bankName: bankName,
          accountHolder: bankAccountHolder,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfscCode
        }
      });
      if (res.data?.success || res.data) {
        alert("Bank details saved successfully!");
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to save bank details: " + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });
      if (res.data?.success || res.data) {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to change password: " + (err.response?.data?.error?.message || err.message));
    }
  };

  const handlePhotoUploadSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?._id) return;
    
    // Convert to mock base64/URL or simple object URL
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await api.put(`/franchise/${profile._id}`, {
          logo: base64Data
        });
        if (res.data?.success || res.data) {
          setUploadedLogo(base64Data);
          alert("Profile picture uploaded successfully!");
          fetchDashboardData();
        }
      } catch (err: any) {
        console.error(err);
        alert("Failed to upload photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemoveSubmit = async () => {
    if (!profile?._id) return;
    try {
      const res = await api.put(`/franchise/${profile._id}`, {
        logo: ""
      });
      if (res.data?.success || res.data) {
        setUploadedLogo(null);
        alert("Profile picture removed successfully!");
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to remove photo.");
    }
  };

  const handleDocumentUploadSubmit = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?._id) return;

    try {
      // Append document to franchise schema with status pending
      const updatedDocs = [...(profile.documents || [])];
      // Check if document of this type already exists, if so overwrite, else push
      const idx = updatedDocs.findIndex((d: any) => d.type === type);
      const newDoc = {
        type,
        fileUrl: file.name,
        status: "pending"
      };
      if (idx >= 0) {
        updatedDocs[idx] = newDoc;
      } else {
        updatedDocs.push(newDoc);
      }

      const res = await api.put(`/franchise/${profile._id}`, {
        documents: updatedDocs
      });
      if (res.data?.success || res.data) {
        alert(`${type} uploaded successfully! Set to pending verification by administrator.`);
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload document.");
    }
  };

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
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shadow-inner flex-shrink-0">
            <img src="/logo.png" className="w-full h-full object-contain" alt="GoMotorCar Logo" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-wide leading-none">GoMotorCar</h1>
            <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1">Franchise Partner</p>
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
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-0.5 shadow-inner flex-shrink-0">
              <img src="/logo.png" className="w-full h-full object-contain" alt="GoMotorCar Logo" />
            </div>
            <h1 className={`font-bold ${["bookings", "customers"].includes(activeTab) ? "text-slate-800" : "text-white"} text-md`}>GoMotorCar</h1>
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
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Row 1: Key Statistics Cards with Sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div onClick={() => setActiveTab("bookings")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all flex flex-col justify-between h-40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
                    <span className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-650 text-base shadow-sm">📅</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-black text-slate-800">{stats.todayBookings || 24}</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 20% <span className="text-slate-400 font-semibold">vs yesterday</span></p>
                  </div>
                  <div className="w-full h-8 mt-2">
                    <svg className="w-full h-full text-purple-500" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none">
                      <path d="M0 25 Q 20 10, 40 20 T 80 10 T 100 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 2 */}
                <div onClick={() => setActiveTab("bookings")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all flex flex-col justify-between h-40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Services</span>
                    <span className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-base shadow-sm">🚗</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-black text-slate-850">{stats.activeBookings || 18}</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 12% <span className="text-slate-400 font-semibold">vs yesterday</span></p>
                  </div>
                  <div className="w-full h-8 mt-2">
                    <svg className="w-full h-full text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none">
                      <path d="M0 28 Q 20 20, 40 25 T 80 15 T 100 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 3 */}
                <div onClick={() => setActiveTab("earnings")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all flex flex-col justify-between h-40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
                    <span className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-650 text-base shadow-sm">₹</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-slate-805">₹{(stats.monthlyRevenue || 245680).toLocaleString()}</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 18% <span className="text-slate-400 font-semibold">vs last month</span></p>
                  </div>
                  <div className="w-full h-8 mt-2">
                    <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none">
                      <path d="M0 25 Q 20 15, 40 18 T 80 10 T 100 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 4 */}
                <div onClick={() => setActiveTab("wallet")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all flex flex-col justify-between h-40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payments</span>
                    <span className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-base shadow-sm">💳</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-slate-855">₹{(stats.pendingPayments || 48320).toLocaleString()}</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">↓ 8% <span className="text-slate-400 font-semibold">vs last month</span></p>
                  </div>
                  <div className="w-full h-8 mt-2">
                    <svg className="w-full h-full text-amber-500" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none">
                      <path d="M0 20 Q 20 25, 40 18 T 80 22 T 100 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 2: Secondary stats with Toggles & Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div onClick={() => setActiveTab("staff")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all h-36 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Present</span>
                    <span className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-650 text-sm shadow-sm">👥</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-805">12 / 15</p>
                    <p className="text-[9px] text-slate-450 font-bold mt-1"><span className="text-emerald-600 font-black">80%</span> Present</p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[80%] rounded-full"></div>
                  </div>
                </div>

                <div onClick={() => setActiveTab("customers")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all h-36 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Customers</span>
                    <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-655 text-sm shadow-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-850">36</p>
                    <p className="text-[9px] text-emerald-600 font-black mt-1">↑ 15% <span className="text-slate-400 font-semibold">vs last month</span></p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[65%] rounded-full"></div>
                  </div>
                </div>

                <div onClick={() => setActiveTab("ratings")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all h-36 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Ratings</span>
                    <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-650 text-sm shadow-sm">⭐</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-855">4.7 / 5</p>
                    <p className="text-[9px] text-emerald-600 font-black mt-1">↑ 0.3 <span className="text-slate-400 font-semibold">vs last month</span></p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[94%] rounded-full"></div>
                  </div>
                </div>

                <div onClick={() => setActiveTab("complaints")} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm cursor-pointer hover:border-slate-200 transition-all h-36 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Complaints</span>
                    <span className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 text-sm shadow-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-855">5</p>
                    <p className="text-[9px] text-rose-600 font-black mt-1">↓ 10% <span className="text-slate-400 font-semibold">vs last month</span></p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[25%] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Row 3: Charts Row (4 Columns Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-72">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-850">Revenue Trend</h3>
                    <select className="text-[9px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>
                  <div className="my-2">
                    <p className="text-lg font-black text-slate-800">₹2,45,680</p>
                  </div>
                  <div className="relative h-32 w-full flex items-end">
                    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                      <path d="M5 40 L 20 28 L 35 18 L 50 24 L 65 15 L 80 20 L 95 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 40 L 20 28 L 35 18 L 50 24 L 65 15 L 80 20 L 95 10 L 95 50 L 5 50 Z" fill="url(#dash-rev-gradient)" opacity="0.05" />
                      <defs>
                        <linearGradient id="dash-rev-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-between text-[6.5px] text-slate-400 font-bold items-start py-1">
                      <span>300K</span>
                      <span>200K</span>
                      <span>100K</span>
                      <span>0</span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 flex justify-between text-[6.5px] text-slate-400 font-bold px-1.5">
                      <span>1 May</span>
                      <span>10 May</span>
                      <span>20 May</span>
                      <span>31 May</span>
                    </div>
                  </div>
                </div>

                {/* Booking Analytics */}
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-72">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-850">Booking Analytics</h3>
                    <select className="text-[9px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="flex flex-col items-center py-2">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="4.5" strokeDasharray="67 33" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="-67" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeDasharray="13 87" strokeDashoffset="-87" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-xs font-black text-slate-800">240</p>
                        <p className="text-[5px] text-slate-400 uppercase font-black tracking-wider">Total</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[8px] text-slate-505 font-bold">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completed</span>
                      <span>160 (67%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Ongoing</span>
                      <span>48 (20%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Cancelled</span>
                      <span>32 (13%)</span>
                    </div>
                  </div>
                </div>

                {/* Customer Growth */}
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-72">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-850">Customer Growth</h3>
                    <select className="text-[9px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>
                  <div className="my-1">
                    <p className="text-[11px] text-slate-500 font-bold"><span className="text-blue-650 text-sm font-black">+128</span> New Customers</p>
                  </div>
                  
                  <div className="relative h-28 w-full flex items-end justify-between px-1">
                    {[30, 45, 60, 95, 48, 80, 100].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                        <div className="w-2.5 bg-slate-100 rounded-t h-20 overflow-hidden relative flex items-end">
                          <div className="bg-blue-600 w-full rounded-t" style={{ height: `${(val / 150) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[6px] text-slate-405 font-bold pt-1 pb-4">
                      <span>150</span>
                      <span>120</span>
                      <span>90</span>
                      <span>60</span>
                      <span>30</span>
                      <span>0</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[6.5px] text-slate-400 font-bold px-1.5 border-t border-slate-50 pt-1">
                    <span>1 May</span>
                    <span>10 May</span>
                    <span>20 May</span>
                    <span>31 May</span>
                  </div>
                </div>

                {/* Service Performance */}
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-72">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-850">Service Performance</h3>
                    <select className="text-[9px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="flex flex-col items-center py-2">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray="40 60" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="4.5" strokeDasharray="25 75" strokeDashoffset="-40" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F97316" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="-65" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="-85" />
                      </svg>
                      <div className="absolute text-center leading-none">
                        <p className="text-[4px] text-slate-405 font-bold uppercase">Top Service</p>
                        <p className="text-[7.5px] font-black text-slate-800 mt-0.5">Steam Wash</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[8px] text-slate-505 font-bold">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Steam Wash</span>
                      <span>40%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Foam Wash</span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Interior Cleaning</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Ceramic Coating</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Appointments, Activities, and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-black text-slate-850">Upcoming Appointments</h3>
                      <button onClick={() => setActiveTab("bookings")} className="text-[10px] text-blue-650 hover:text-blue-500 font-bold">View All</button>
                    </div>
                    
                    <div className="space-y-3.5">
                      {[
                        { time: '10:00 AM', name: 'Ravi Sharma', service: 'DL 10 AB 1234', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { time: '11:30 AM', name: 'Neha Gupta', service: 'Interior Cleaning', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60' },
                        { time: '01:00 PM', name: 'Amit Verma', service: 'Foam Wash', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60' },
                        { time: '03:30 PM', name: 'Pooja Singh', service: 'Ceramic Coating', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex-shrink-0">
                              <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-805 block leading-tight">{item.name}</span>
                              <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">{item.service}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black text-blue-600 block">{item.time}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-50 text-blue-650 block mt-1">Upcoming</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-black text-slate-850">Recent Activities</h3>
                      <button className="text-[10px] text-blue-650 hover:text-blue-500 font-bold">View All</button>
                    </div>

                    <div className="space-y-4">
                      {[
                        { title: 'New booking created', desc: 'Ravi Sharma - Steam Wash', time: '10:15 AM', icon: '📅', iconBg: 'bg-blue-50 text-blue-600' },
                        { title: 'Payment received', desc: '₹1,250 from Neha Gupta', time: '09:45 AM', icon: '💵', iconBg: 'bg-emerald-50 text-emerald-600' },
                        { title: 'New customer added', desc: 'Amit Verma', time: '09:30 AM', icon: '👥', iconBg: 'bg-purple-50 text-purple-650' },
                        { title: 'Service completed', desc: 'Foam Wash - UP 14 GH 3456', time: '09:10 AM', icon: '✓', iconBg: 'bg-emerald-50 text-emerald-650' },
                        { title: 'Complaint raised', desc: 'Water leakage issue', time: '08:50 AM', icon: '⚠️', iconBg: 'bg-rose-50 text-rose-600' }
                      ].map((act, idx) => (
                        <div key={idx} className="flex items-start gap-3.5 text-xs font-semibold">
                          <div className={`w-8 h-8 rounded-full ${act.iconBg} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
                            {act.icon}
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-slate-805 block leading-tight">{act.title}</span>
                            <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">{act.desc}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-850 pb-2 border-b border-slate-100 mb-4">Quick Actions</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab("bookings")} className="flex flex-col items-center justify-center p-4.5 bg-blue-50/50 hover:bg-blue-100/50 rounded-2xl border border-blue-100 gap-2 cursor-pointer transition-all shadow-sm">
                        <span className="text-xl">📅</span>
                        <span className="text-[10px] font-black text-blue-650">Create Booking</span>
                      </button>

                      <button onClick={() => setActiveTab("profile")} className="flex flex-col items-center justify-center p-4.5 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-2xl border border-emerald-100 gap-2 cursor-pointer transition-all shadow-sm">
                        <span className="text-xl">👥</span>
                        <span className="text-[10px] font-black text-emerald-650">Add Customer</span>
                      </button>

                      <button onClick={() => setActiveTab("staff")} className="flex flex-col items-center justify-center p-4.5 bg-purple-50/50 hover:bg-purple-100/50 rounded-2xl border border-purple-100 gap-2 cursor-pointer transition-all shadow-sm">
                        <span className="text-xl">👥</span>
                        <span className="text-[10px] font-black text-purple-650">Add Staff</span>
                      </button>

                      <button onClick={() => setActiveTab("complaints")} className="flex flex-col items-center justify-center p-4.5 bg-rose-50/50 hover:bg-rose-100/50 rounded-2xl border border-rose-100 gap-2 cursor-pointer transition-all shadow-sm">
                        <span className="text-xl">⚠️</span>
                        <span className="text-[10px] font-black text-rose-600">Raise Complaint</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Notifications List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-850">Notifications</h3>
                  <button onClick={() => setActiveTab("notifications")} className="text-[10px] text-blue-650 hover:text-blue-500 font-bold">Mark all as read</button>
                </div>
                
                <div className="space-y-3.5">
                  {[
                    { title: 'New booking received for today at 04:30 PM', desc: 'Customer: Vikram Patel | Service: Steam Wash', time: '5m ago', icon: '🔔', iconBg: 'bg-blue-50 text-blue-600' },
                    { title: 'Payment of ₹2,450 received successfully', desc: 'Booking ID: BK-1256', time: '15m ago', icon: '💵', iconBg: 'bg-emerald-50 text-emerald-655' },
                    { title: 'Complaint raised by Neha Gupta', desc: 'Regarding: Service delay', time: '1h ago', icon: '⚠️', iconBg: 'bg-rose-50 text-rose-600' },
                    { title: 'Monthly report is ready', desc: 'Click to view your April 2025 performance report', time: '2h ago', icon: '📊', iconBg: 'bg-purple-50 text-purple-650' }
                  ].map((notif, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${notif.iconBg} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
                          {notif.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{notif.title}</p>
                          <p className="text-[10px] text-slate-450 font-bold mt-0.5">{notif.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{notif.time}</span>
                        {/* Red Dot unread indicator */}
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10 max-w-5xl mx-auto">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Bookings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">New Booking</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">New Booking</h2>
                  <p className="text-xs text-slate-555 mt-1">Create a new service booking for your customer.</p>
                </div>
                <button 
                  onClick={() => setViewNewBooking(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  ← Back to Bookings
                </button>
              </div>

              {/* 1. Customer Details */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs shadow-sm">👤</span>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">1. Customer Details</h3>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-500">Customer *</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
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
                            const veh = vehiclesList.find(v => v.customerId === found._id);
                            if (veh) setSelectedVehicleForBooking(veh);
                          }
                        }}
                        className="w-full rounded-xl bg-slate-55 border border-slate-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 font-semibold"
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab("customers")}
                      className="px-4 py-2.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      + Add New Customer
                    </button>
                  </div>

                  {selectedCustomerForBooking ? (
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm relative">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" alt="Rahul Sharma" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 flex items-center gap-2">
                            {selectedCustomerForBooking.firstName} {selectedCustomerForBooking.lastName} 
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-650 rounded text-[9px] font-black uppercase">VIP</span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">📞 {selectedCustomerForBooking.phone} | {selectedCustomerForBooking.email || "rahulsharma@gmail.com"}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">📍 {selectedCustomerForBooking.address || "Sector 62, Noida, Uttar Pradesh - 201301"}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold pr-8">
                        <p className="text-slate-400">Total Bookings</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">24</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Last Booking: 24 May 2025</p>
                      </div>
                      <button 
                        onClick={() => setSelectedCustomerForBooking(null)}
                        className="absolute right-3.5 top-3.5 w-6 h-6 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 font-black cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic font-semibold">No customer selected. Type above to filter & select a customer.</div>
                  )}
                </div>
              </div>

              {/* 2. Vehicle Details */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs shadow-sm">🚗</span>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">2. Vehicle Details</h3>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-500">Vehicle *</label>
                  <div className="flex gap-3">
                    <select 
                      value={selectedVehicleForBooking?._id || ""}
                      onChange={(e) => {
                        const veh = vehiclesList.find(v => v._id === e.target.value);
                        if (veh) setSelectedVehicleForBooking(veh);
                      }}
                      className="flex-1 rounded-xl bg-slate-55 border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 font-semibold cursor-pointer"
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
                      className="px-4 py-2.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      + Add New Vehicle
                    </button>
                  </div>

                  {selectedVehicleForBooking ? (
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm relative">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-white border border-slate-150 flex items-center justify-center flex-shrink-0">
                        {/* Toyota Fortuner image matching mockup */}
                        <img src="https://images.unsplash.com/photo-1617886903355-9354be5f65c2?auto=format&fit=crop&q=80&w=150" alt="Toyota Fortuner" className="w-full h-full object-cover" />
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-[10px] font-semibold text-slate-650 flex-1">
                        <div>
                          <p className="text-slate-800 font-black text-xs">{selectedVehicleForBooking.brand} {selectedVehicleForBooking.model}</p>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-650 rounded text-[9px] font-black uppercase mt-1 block w-fit">
                            {selectedVehicleForBooking.plateNumber || selectedVehicleForBooking.vehicleNumber}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-bold">Color</p>
                          <p className="text-slate-800 font-black mt-0.5">{selectedVehicleForBooking.color || "White"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-bold">Model Year</p>
                          <p className="text-slate-800 font-black mt-0.5">2021</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-bold">Fuel Type</p>
                          <p className="text-slate-800 font-black mt-0.5">{selectedVehicleForBooking.fuelType || "Diesel"}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedVehicleForBooking(null)}
                        className="absolute right-3.5 top-3.5 w-6 h-6 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 font-black cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic font-semibold">No vehicle selected. Dropdown select above to link vehicle.</div>
                  )}
                </div>
              </div>

              {/* 3. Service Package */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs shadow-sm">📦</span>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">3. Service Package</h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Service Package *</label>
                  <select 
                    value={selectedServicePackage}
                    onChange={(e) => setSelectedServicePackage(e.target.value)}
                    className="w-full rounded-xl bg-slate-55 border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    <option value="">Select a service package</option>
                    <option value="Premium Steam Wash">Premium Steam Wash (₹1,250)</option>
                    <option value="Interior Cleaning">Interior Cleaning (₹850)</option>
                    <option value="Foam Wash">Foam Wash (₹650)</option>
                    <option value="Ceramic Coating">Ceramic Coating (₹3,500)</option>
                  </select>
                </div>
              </div>

              {/* 4. Schedule Date & Time */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs shadow-sm">📅</span>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">4. Schedule Date & Time</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-550 font-bold mb-2">Schedule Date *</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={selectedBookingDate}
                        onChange={(e) => setSelectedBookingDate(e.target.value)}
                        className="w-full rounded-xl bg-slate-55 border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-semibold cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-550 font-bold mb-2">Schedule Time *</label>
                    <select 
                      value={selectedBookingTime}
                      onChange={(e) => setSelectedBookingTime(e.target.value)}
                      className="w-full rounded-xl bg-slate-55 border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold cursor-pointer"
                    >
                      <option value="">Select time</option>
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

              {/* 5. Select Services */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs shadow-sm">🛒</span>
                  <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider">5. Select Services</h3>
                </div>
                <p className="text-[10px] text-slate-450 font-bold">Choose one or more services for this booking.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                  {[
                    { label: 'Exterior Wash', price: '₹300', icon: '🚗', rawPrice: 300 },
                    { label: 'Interior Cleaning', price: '₹400', icon: '🧼', rawPrice: 400 },
                    { label: 'Steam Wash', price: '₹500', icon: '💨', rawPrice: 500 },
                    { label: 'Deep Cleaning', price: '₹700', icon: '✨', rawPrice: 700 },
                    { label: 'Ceramic Coating', price: '₹2,500', icon: '🛡️', rawPrice: 2500 },
                    { label: 'Foam Wash', price: '₹600', icon: '🫧', rawPrice: 600 },
                    { label: 'Engine Wash', price: '₹500', icon: '⚙️', rawPrice: 500 },
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
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative ${
                        selectedServicesChecklist.includes(srv.label)
                          ? "bg-blue-50/50 border-blue-300 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedServicesChecklist.includes(srv.label)}
                        readOnly
                        className="absolute right-3.5 top-3.5 w-4 h-4 cursor-pointer text-blue-600" 
                      />
                      <span className="text-2xl mt-2">{srv.icon}</span>
                      <p className="text-xs font-bold mt-1 text-slate-800">{srv.label}</p>
                      <span className="text-[10px] font-black text-slate-500 block mt-0.5">{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Additional Notes */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider">6. Additional Notes (Optional)</h3>
                <textarea 
                  placeholder="Enter any special instructions or notes..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full h-24 rounded-xl bg-slate-55 border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs text-slate-800 font-semibold"
                />
              </div>

              {/* Booking Summary sticky bottom info */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between text-xs font-semibold text-slate-505">
                <div>
                  <span className="text-slate-400 font-bold block">Estimated Amount</span>
                  <span className="text-xl font-black text-blue-600 block mt-1">
                    ₹{(
                      (selectedServicePackage === "Premium Steam Wash" ? 1250 : selectedServicePackage === "Interior Cleaning" ? 850 : selectedServicePackage === "Foam Wash" ? 650 : selectedServicePackage === "Ceramic Coating" ? 3500 : 0) +
                      selectedServicesChecklist.reduce((acc, curr) => {
                        const prices: Record<string, number> = { 'Exterior Wash': 300, 'Interior Cleaning': 400, 'Steam Wash': 500, 'Deep Cleaning': 700, 'Ceramic Coating': 2500, 'Foam Wash': 600, 'Engine Wash': 500 };
                        return acc + (prices[curr] || 0);
                      }, 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Selected Services</span>
                  <span className="text-xs text-slate-805 font-bold block mt-1">
                    {selectedServicePackage ? '1 Package' : '0 Packages'} {selectedServicesChecklist.length > 0 ? `+ ${selectedServicesChecklist.length} Add-on` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Duration</span>
                  <span className="text-xs text-slate-805 font-bold block mt-1">
                    {(selectedServicePackage ? 60 : 0) + (selectedServicesChecklist.length * 20)} mins
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCreateBooking}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
              >
                📅 Create Booking
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
                                className="flex-1 md:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
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
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
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
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Staff Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Attendance Management</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Attendance Management</h2>
                  <p className="text-xs text-slate-555 mt-1">Mark and manage staff attendance with accuracy.</p>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">32</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">All Registered Staff</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    👥
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present Today</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">24</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">75.00% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-xl shadow-sm">
                    ✓
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absent Today</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">5</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">15.63% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-xl shadow-sm">
                    ❌
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">On Leave</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">3</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">9.38% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    📅
                  </div>
                </div>
              </div>

              {/* Mark Attendance card panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-850">Mark Attendance</h3>
                  <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1">
                    🔄 Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-semibold text-slate-700">
                  {/* Left option switches */}
                  <div className="md:col-span-4 space-y-3.5">
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👆</span>
                        <div>
                          <span className="font-bold text-blue-800 block leading-tight">Manual Attendance</span>
                          <span className="text-[8.5px] text-blue-500 font-bold block mt-0.5">Mark attendance manually</span>
                        </div>
                      </div>
                      <input type="radio" defaultChecked className="text-blue-600 w-4 h-4 cursor-pointer" />
                    </div>

                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📷</span>
                        <div>
                          <span className="font-bold text-slate-800 block leading-tight">Selfie Attendance</span>
                          <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">Mark attendance with selfie</span>
                        </div>
                      </div>
                      <input type="radio" className="text-slate-400 w-4 h-4 cursor-pointer" />
                    </div>

                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📍</span>
                        <div>
                          <span className="font-bold text-slate-800 block leading-tight">Geo Attendance</span>
                          <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">Mark attendance with location</span>
                        </div>
                      </div>
                      <input type="radio" className="text-slate-400 w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                  {/* Middle portrait indicator */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center text-center gap-3 border-l border-r border-slate-100 px-6 py-2">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/35 bg-slate-50 shadow-sm flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-emerald-600 font-black text-xs flex items-center gap-1.5 justify-center">✓ Attendance Marked</p>
                      <p className="text-[10px] text-slate-800 font-bold">26 May 2025, 09:15 AM</p>
                      <p className="text-[8.5px] text-slate-400 font-bold">Location: Sector 62, Noida</p>
                    </div>
                  </div>

                  {/* Right summary table */}
                  <div className="md:col-span-4 space-y-3 pl-4 pt-1">
                    <h4 className="text-xs font-black text-slate-800 pb-1.5 border-b border-slate-50">Today's Attendance Summary</h4>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Check In Time</span>
                      <span className="text-emerald-650 font-bold">09:15 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Check Out Time</span>
                      <span className="text-slate-700 font-bold">--</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Total Working Hours</span>
                      <span className="text-slate-700 font-bold">--</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Location</span>
                      <span className="text-slate-750 font-bold">Sector 62, Noida</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Device</span>
                      <span className="text-slate-750 font-bold">Mobile App (Android)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Status</span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-650">Present</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-550/20 cursor-pointer">
                      <option>26 May 2025</option>
                    </select>
                  </div>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Departments</option>
                  </select>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Roles</option>
                  </select>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📥 Download
                  </button>
                </div>
              </div>

              {/* Attendance Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Staff Member</th>
                        <th className="py-4.5 px-4">Department</th>
                        <th className="py-4.5 px-4">Role</th>
                        <th className="py-4.5 px-4">Check In</th>
                        <th className="py-4.5 px-4">Check Out</th>
                        <th className="py-4.5 px-4">Working Hours</th>
                        <th className="py-4.5 px-4">Location</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { id: 'STF001', name: 'Amit Verma', dep: 'Operations', role: 'Supervisor', checkin: '09:15 AM', checkinDate: '26 May 2025', checkout: '06:05 PM', checkoutDate: '26 May 2025', hours: '8h 50m', loc: 'Sector 62, Noida', status: 'Present', badge: 'bg-emerald-50 text-emerald-650', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { id: 'STF002', name: 'Rahul Sharma', dep: 'Cleaning', role: 'Technician', checkin: '08:58 AM', checkinDate: '26 May 2025', checkout: '05:42 PM', checkoutDate: '26 May 2025', hours: '8h 44m', loc: 'Sector 63, Noida', status: 'Present', badge: 'bg-emerald-50 text-emerald-650', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=60' },
                        { id: 'STF003', name: 'Vikram Singh', dep: 'Cleaning', role: 'Cleaner', checkin: '--', checkinDate: '', checkout: '--', checkoutDate: '', hours: '--', loc: '--', status: 'Absent', badge: 'bg-rose-50 text-rose-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'STF004', name: 'Sandeep Yadav', dep: 'Detailing', role: 'Detailer', checkin: '09:05 AM', checkinDate: '26 May 2025', checkout: '06:02 PM', checkoutDate: '26 May 2025', hours: '8h 57m', loc: 'Sector 61, Noida', status: 'Present', badge: 'bg-emerald-50 text-emerald-650', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'STF005', name: 'Mohit Kumar', dep: 'Mechanical', role: 'Technician', checkin: '09:20 AM', checkinDate: '26 May 2025', checkout: '--', checkoutDate: '', hours: '--', loc: 'Sector 62, Noida', status: 'On Leave', badge: 'bg-amber-50 text-amber-600', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=60' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-55 shadow-sm flex items-center justify-center flex-shrink-0">
                                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.dep}</td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.role}</td>
                          <td className="py-4 px-4">
                            {item.checkin !== '--' ? (
                              <div className="space-y-0.5">
                                <span className="text-emerald-600 font-bold block">🟢 {item.checkin}</span>
                                <span className="text-[8.5px] text-slate-400 font-bold">{item.checkinDate}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {item.checkout !== '--' ? (
                              <div className="space-y-0.5">
                                <span className="text-emerald-600 font-bold block">🟢 {item.checkout}</span>
                                <span className="text-[8.5px] text-slate-400 font-bold">{item.checkoutDate}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.hours}</td>
                          <td className="py-4 px-4">
                            {item.loc !== '--' ? (
                              <span className="text-slate-700 font-semibold">📍 {item.loc}</span>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${item.badge}`}>{item.status}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">👁️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">📷</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">✏️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-550 bg-slate-50/30">
                  <span>Showing 1 to 5 of 32 staff members</span>
                  <div className="flex items-center gap-1.5">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">‹</button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg cursor-pointer">1</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">2</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">3</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">4</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">5</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">›</button>
                  </div>
                </div>
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
                reorder: 25,
                desc: 'Premium quality car shampoo for exterior wash. Safe for all types of car paint.'
              };

              return (
                <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
                  {/* Breadcrumbs & Navigation Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span className="hover:text-slate-650 cursor-pointer" onClick={() => setSelectedItemId(null)}>Inventory Management</span>
                        <span className="text-slate-300">/</span>
                        <span className="hover:text-slate-650 cursor-pointer" onClick={() => setSelectedItemId(null)}>Inventory List</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">Inventory Details</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Inventory Details</h2>
                      <p className="text-xs text-slate-550 mt-1">View complete details, history and alerts for the selected item.</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                        ✏️ Edit Item
                      </button>
                      <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                        📥 Print / Export
                      </button>
                    </div>
                  </div>

                  {/* Profile Header Box */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left Column: Avatar & Basic Details */}
                    <div className="lg:col-span-4 flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center bg-slate-50">
                        <img 
                          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=60&w=120" 
                          alt="Car Shampoo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{item.name}</h3>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase">In Stock</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-500 pt-1">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">SKU</span>
                            <span className="text-slate-800 font-bold">{item.sku}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Category</span>
                            <span className="text-slate-800 font-bold">{item.cat}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Unit</span>
                            <span className="text-slate-800 font-bold">{item.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Location</span>
                            <span className="text-slate-800 font-bold">{item.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column: Description */}
                    <div className="lg:col-span-3 text-xs text-slate-500 border-l border-slate-100 pl-6 space-y-1.5">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Description</span>
                      <p className="text-slate-700 font-semibold leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Right Column: Stock Summary Indicators */}
                    <div className="lg:col-span-5 grid grid-cols-4 gap-3 border-l border-slate-100 pl-6">
                      <div className="p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[7px] text-slate-400 uppercase font-black tracking-wider">Current Stock</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{item.stock} L</p>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[7px] text-slate-400 uppercase font-black tracking-wider">Min Stock</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{item.minStock} L</p>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[7px] text-slate-400 uppercase font-black tracking-wider">On Order</p>
                        <p className="text-sm font-black text-blue-600 mt-1">{item.onOrder} L</p>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[7px] text-slate-400 uppercase font-black tracking-wider">Reorder Level</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{item.reorder} L</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs Navigation */}
                  <div className="flex border-b border-slate-200 text-xs font-bold text-slate-400">
                    <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 tracking-wide">Stock History</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Usage History</button>
                    <button className="px-6 py-3 hover:text-slate-700 tracking-wide">Low Stock Alerts</button>
                  </div>

                  {/* Split Content Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Stock History Panel */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-wide">Stock History</h3>
                            <p className="text-[10px] text-slate-455 mt-0.5">All stock in and stock out transactions.</p>
                          </div>
                          <button className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm">
                            📥 Export
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                                <th className="pb-3 px-3">Date & Time</th>
                                <th className="pb-3 px-3">Type</th>
                                <th className="pb-3 px-3">Reference No.</th>
                                <th className="pb-3 px-3">Quantity</th>
                                <th className="pb-3 px-3">Balance</th>
                                <th className="pb-3 px-3">Performed By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                              {[
                                { dt: '26 May 2025, 09:30 AM', type: 'Stock In', typeColor: 'text-emerald-600 bg-emerald-50', ref: 'GRN-2025-056', qty: '+50 Litre', bal: '120 Litre', by: 'Admin' },
                                { dt: '24 May 2025, 04:15 PM', type: 'Stock Out', typeColor: 'text-rose-600 bg-rose-50', ref: 'ISS-2025-042', qty: '-15 Litre', bal: '70 Litre', by: 'Rohit Sharma' },
                                { dt: '22 May 2025, 11:10 AM', type: 'Stock In', typeColor: 'text-emerald-600 bg-emerald-50', ref: 'GRN-2025-041', qty: '+40 Litre', bal: '85 Litre', by: 'Admin' },
                                { dt: '20 May 2025, 03:20 PM', type: 'Stock Out', typeColor: 'text-rose-600 bg-rose-50', ref: 'ISS-2025-033', qty: '-20 Litre', bal: '45 Litre', by: 'Vikram Singh' },
                                { dt: '18 May 2025, 10:05 AM', type: 'Stock In', typeColor: 'text-emerald-600 bg-emerald-50', ref: 'GRN-2025-028', qty: '+60 Litre', bal: '65 Litre', by: 'Admin' }
                              ].map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-3 font-semibold text-slate-500">{item.dt}</td>
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.typeColor}`}>{item.type}</span>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-800">{item.ref}</td>
                                  <td className="py-3 px-3 font-black text-slate-800">{item.qty}</td>
                                  <td className="py-3 px-3 font-bold text-slate-650">{item.bal}</td>
                                  <td className="py-3 px-3 font-bold text-slate-600">{item.by}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button className="w-full text-center py-2.5 mt-4 border-t border-slate-100 hover:bg-slate-50 text-[11px] text-blue-650 font-bold flex items-center justify-center gap-1">
                          View All Stock History <span>→</span>
                        </button>
                      </div>

                      {/* Usage History Panel */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-wide">Usage History</h3>
                            <p className="text-[10px] text-slate-455 mt-0.5">Track how this item is used over time.</p>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                                  <th className="pb-2.5">Date</th>
                                  <th className="pb-2.5">Used In</th>
                                  <th className="pb-2.5 text-center">Qty Used</th>
                                  <th className="pb-2.5">By</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-slate-700">
                                {[
                                  { dt: '26 May 2025', desc: 'Service #SVC-2025-189', qty: '5 Litre', by: 'Rohit Sharma' },
                                  { dt: '26 May 2025', desc: 'Service #SVC-2025-188', qty: '4 Litre', by: 'Amit Verma' },
                                  { dt: '25 May 2025', desc: 'Service #SVC-2025-183', qty: '6 Litre', by: 'Vikram Singh' },
                                  { dt: '25 May 2025', desc: 'Service #SVC-2025-181', qty: '5 Litre', by: 'Rohit Sharma' },
                                  { dt: '24 May 2025', desc: 'Service #SVC-2025-179', qty: '7 Litre', by: 'Amit Verma' }
                                ].map((row, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-2.5 text-slate-500 font-semibold">{row.dt}</td>
                                    <td className="py-2.5 font-bold text-slate-800">{row.desc}</td>
                                    <td className="py-2.5 text-center font-black text-slate-850">{row.qty}</td>
                                    <td className="py-2.5 font-bold text-slate-600">{row.by}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button className="text-[11px] text-blue-650 font-bold hover:text-blue-500 flex items-center gap-1 mt-2">
                            View All Usage History <span>→</span>
                          </button>
                        </div>

                        {/* Usage Trend Chart */}
                        <div className="md:col-span-5 flex flex-col justify-between">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-slate-850">Usage Trend (Last 7 Days)</span>
                            <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold">Last 7 Days ∨</span>
                          </div>
                          {/* Sparkline chart visual */}
                          <div className="relative h-32 w-full mt-4 flex items-end">
                            <svg className="w-full h-full text-blue-600" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                              <path d="M0 40 L 15 32 L 30 20 L 45 35 L 60 15 L 75 10 L 90 22 L 100 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M0 40 L 15 32 L 30 20 L 45 35 L 60 15 L 75 10 L 90 22 L 100 25 L 100 50 L 0 50 Z" fill="url(#blue-gradient)" opacity="0.1" />
                              <defs>
                                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex justify-between text-[7px] text-slate-400 font-bold items-start pt-1">
                              <span>40</span>
                              <span>20</span>
                              <span>0</span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[7px] text-slate-400 font-bold pt-1">
                              <span>20 May</span>
                              <span>22 May</span>
                              <span>24 May</span>
                              <span>26 May</span>
                            </div>
                          </div>
                          <button className="text-[11px] text-blue-650 font-bold hover:text-blue-500 mt-4 flex items-center gap-1 justify-center">
                            View Full Usage Report <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right column sidebar */}
                    <div className="space-y-6">
                      {/* Low Stock Alerts Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                          <h3 className="text-sm font-black text-slate-850">Low Stock Alerts</h3>
                          <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold cursor-pointer">
                            <option>All Locations</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: 'Microfiber Cloth', loc: 'Main Store', curr: '15 Pcs', min: '15 Pcs', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=60&w=60' },
                            { name: 'Active Foam', loc: 'Main Store', curr: '15 Litre', min: '15 Litre', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=60&w=60' },
                            { name: 'Steam Chemicals', loc: 'Branch Store', curr: '10 Litre', min: '10 Litre', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=60&w=60' },
                            { name: 'Uniform', loc: 'Branch Store', curr: '10 Set', min: '10 Set', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=60&w=60' }
                          ].map((alertRow, alertIdx) => (
                            <div key={alertIdx} className="p-3 border border-slate-100 bg-slate-50/30 rounded-2xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                                  <img src={alertRow.img} alt={alertRow.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-800 leading-tight">{alertRow.name}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{alertRow.loc}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-semibold">Current: {alertRow.curr}</p>
                                <p className="text-[9px] text-slate-400 font-semibold">Min: {alertRow.min}</p>
                                <span className="inline-block mt-1 text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">Low Stock</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="w-full text-center py-2.5 mt-4 border-t border-slate-100 hover:bg-slate-50 text-[11px] text-blue-650 font-bold flex items-center justify-center gap-1">
                          View All Low Stock Alerts <span>→</span>
                        </button>
                      </div>

                      {/* Item Information Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-xs text-slate-500">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                          <h3 className="text-sm font-black text-slate-900 tracking-wide">Item Information</h3>
                          <button className="text-[10px] text-blue-600 hover:text-blue-500 font-bold">📝 Edit Info</button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Brand</span>
                            <span className="text-slate-850 font-bold">GoMotorCar</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Shelf Life</span>
                            <span className="text-slate-850 font-bold">24 Months</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Supplier</span>
                            <span className="text-slate-850 font-bold">Auto Care Pvt. Ltd.</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Last Purchased</span>
                            <span className="text-slate-850 font-bold">26 May 2025</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>Purchase Price</span>
                            <span className="text-slate-850 font-bold">₹120.00 / Litre</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span>HSN Code</span>
                            <span className="text-slate-850 font-bold">3402</span>
                          </div>
                          <div className="border-b border-slate-50 pb-1.5">
                            <span className="text-slate-400 block mb-1">Notes</span>
                            <span className="text-slate-700 font-medium">Store in a cool and dry place.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === "inventory" && !selectedItemId && !viewInventoryDashboard && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Inventory Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Inventory List</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Inventory List</h2>
                  <p className="text-xs text-slate-550 mt-1">View and manage all inventory items in your stock.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewInventoryDashboard(true)}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    📊 Inventory Dashboard
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    ➕ Add New Item
                  </button>
                  <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    📥 Import Items
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Items</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">52</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">All inventory items</p>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-base shadow-sm">📦</div>
                </div>
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Items</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">7</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Require attention</p>
                  </div>
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-base shadow-sm">⚠️</div>
                </div>
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between col-span-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Stock Value</span>
                    <p className="text-lg font-black text-slate-855 mt-1.5">₹2,45,680</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Current stock value</p>
                  </div>
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-base shadow-sm">🗄️</div>
                </div>
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Issued Today</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">8</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Total items issued</p>
                  </div>
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-base shadow-sm">📄</div>
                </div>
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Received Today</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">10</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">Total items received</p>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-base shadow-sm">🚚</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[240px]">
                    <input 
                      type="text" 
                      placeholder="Search items by name, SKU..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  </div>
                  
                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Categories</option>
                    <option>Cleaning</option>
                    <option>Accessories</option>
                    <option>Polish</option>
                    <option>Chemicals</option>
                    <option>Uniform</option>
                  </select>

                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>

                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Locations</option>
                    <option>Main Store</option>
                    <option>Branch Store</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📤 Export
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Item</th>
                        <th className="py-4.5 px-4">SKU</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4 text-center">Current Stock</th>
                        <th className="py-4.5 px-4">Unit</th>
                        <th className="py-4.5 px-4 text-center">Min. Stock</th>
                        <th className="py-4.5 px-4">Status</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { id: 'ITM-001', name: 'Shampoo', desc: 'Car Shampoo', cat: 'Cleaning', badge: 'bg-blue-50 text-blue-600', stock: 120, unit: 'Litre', min: 20, status: 'In Stock', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=60&w=120' },
                        { id: 'ITM-002', name: 'Cloth', desc: 'Microfiber Cloth', cat: 'Accessories', badge: 'bg-purple-50 text-purple-600', stock: 85, unit: 'Pcs', min: 15, status: 'In Stock', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=60&w=120' },
                        { id: 'ITM-003', name: 'Wax', desc: 'Car Polish Wax', cat: 'Polish', badge: 'bg-amber-50 text-amber-600', stock: 40, unit: 'Pcs', min: 10, status: 'In Stock', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=60&w=120' },
                        { id: 'ITM-004', name: 'Foam', desc: 'Active Foam', cat: 'Chemicals', badge: 'bg-blue-50 text-blue-600', stock: 65, unit: 'Litre', min: 15, status: 'In Stock', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=60&w=120' },
                        { id: 'ITM-005', name: 'Steam Chemicals', desc: 'Steam Wash Chemical', cat: 'Chemicals', badge: 'bg-blue-50 text-blue-600', stock: 30, unit: 'Litre', min: 10, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=60&w=120' },
                        { id: 'ITM-006', name: 'Uniform', desc: 'Staff Uniform', cat: 'Uniform', badge: 'bg-emerald-50 text-emerald-600', stock: 25, unit: 'Set', min: 10, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=60&w=120' }
                      ].map((item, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => setSelectedItemId(item.id)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">{item.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{item.desc}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-500">{item.id}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${item.badge}`}>
                              {item.cat}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-black text-slate-800">{item.stock}</td>
                          <td className="py-4 px-4 font-semibold text-slate-550">{item.unit}</td>
                          <td className="py-4 px-4 text-center font-bold text-slate-600">{item.min}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm">
                                📝 Issue
                              </button>
                              <button className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm">
                                📥 Receive
                              </button>
                              <button className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm">
                                🔄 Transfer
                              </button>
                              <button className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg shadow-sm">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/30">
                  <span>Showing 1 to 6 of 52 items</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">4</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">5</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Guide Footer */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Guide:</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>In Stock</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Low Stock</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Out of Stock</span>
                </div>
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Keep your inventory updated to avoid service delays and maintain quality.
                </div>
              </div>
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Payment & Earnings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Earnings Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Earnings Dashboard</h2>
                  <p className="text-xs text-slate-550 mt-1">Overview of your earnings and business performance.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm">
                      <option>20 May 2025 - 26 May 2025</option>
                    </select>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>⚙️</span> Filter
                  </button>
                </div>
              </div>

              {/* Stats overview row with sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Earnings</span>
                    <p className="text-2xl font-black text-slate-800 mt-1.5">₹24,560</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +12.5% vs yesterday</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-16 h-8 text-blue-500" viewBox="0 0 50 20" fill="none">
                      <path d="M0 15 Q 10 5, 20 12 T 40 8 T 50 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-base shadow-sm">💰</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Earnings</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">₹1,72,450</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +18.7% vs last week</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 50 20" fill="none">
                      <path d="M0 18 Q 12 12, 24 16 T 36 10 T 50 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-650 text-base shadow-sm">📅</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Earnings</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">₹7,45,230</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +22.3% vs last month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-16 h-8 text-purple-500" viewBox="0 0 50 20" fill="none">
                      <path d="M0 16 Q 10 10, 20 14 T 35 6 T 50 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-base shadow-sm">🗓️</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Profit</span>
                    <p className="text-2xl font-black text-slate-850 mt-1.5">₹4,28,310</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +19.4% vs last month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-16 h-8 text-amber-500" viewBox="0 0 50 20" fill="none">
                      <path d="M0 17 Q 15 15, 25 10 T 38 6 T 50 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-base shadow-sm">💰</div>
                  </div>
                </div>
              </div>

              {/* Middle Grid (Earnings Overview Chart & Earnings by Service Category Donut) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Earnings Overview Double Line Chart Card */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-black text-slate-850">Earnings Overview</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Earnings (₹)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Net Profit (₹)</span>
                      </div>
                    </div>
                    <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl font-bold cursor-pointer">
                      <option>This Week</option>
                    </select>
                  </div>
                  
                  {/* Visual Chart Graphic */}
                  <div className="relative h-56 w-full flex items-end">
                    {/* Double lines sparkline */}
                    <svg className="w-full h-full text-blue-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                      {/* Blue Line (Earnings) */}
                      <path d="M5 28 L 20 22 L 35 26 L 50 18 L 65 24 L 80 15 L 95 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 28 L 20 22 L 35 26 L 50 18 L 65 24 L 80 15 L 95 24 L 95 50 L 5 50 Z" fill="url(#earnings-gradient)" opacity="0.05" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full text-emerald-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                      {/* Green Line (Net Profit) */}
                      <path d="M5 38 L 20 34 L 35 36 L 50 32 L 65 35 L 80 29 L 95 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 38 L 20 34 L 35 36 L 50 32 L 65 35 L 80 29 L 95 38 L 95 50 L 5 50 Z" fill="url(#profit-gradient)" opacity="0.05" />
                      <defs>
                        <linearGradient id="earnings-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                        </linearGradient>
                        <linearGradient id="profit-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                          <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Chart Values Label */}
                    <div className="absolute inset-0 flex flex-col justify-between text-[7px] text-slate-400 font-bold items-start py-2">
                      <span>50K</span>
                      <span>40K</span>
                      <span>30K</span>
                      <span>20K</span>
                      <span>10K</span>
                      <span>0</span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 flex justify-between text-[7px] text-slate-400 font-bold px-3 pt-1">
                      <span>20 May</span>
                      <span>21 May</span>
                      <span>22 May</span>
                      <span>23 May</span>
                      <span>24 May</span>
                      <span>25 May</span>
                      <span>26 May</span>
                    </div>
                  </div>
                </div>

                {/* Earnings by Service Category Donut Chart Card */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-850">Earnings by Service Category</h3>
                    <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="flex flex-col items-center py-2">
                    {/* Donut Chart Visual */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Exterior Wash (32.9%) - Blue */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeDasharray="32.9 67.1" strokeDashoffset="0" />
                        {/* Interior Cleaning (22.2%) - Green */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeDasharray="22.2 77.8" strokeDashoffset="-32.9" />
                        {/* Detailing (16.2%) - Purple */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="3.5" strokeDasharray="16.2 83.8" strokeDashoffset="-55.1" />
                        {/* Steam Wash (11.5%) - Yellow */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EAB308" strokeWidth="3.5" strokeDasharray="11.5 88.5" strokeDashoffset="-71.3" />
                        {/* Ceramic Coating (8.7%) - Teal */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeDasharray="8.7 91.3" strokeDashoffset="-82.8" />
                        {/* Others (8.3%) - Grey */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#94A3B8" strokeWidth="3.5" strokeDasharray="8.3 91.7" strokeDashoffset="-91.5" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-sm font-black text-slate-800">₹7,45,230</p>
                        <p className="text-[7px] text-slate-400 uppercase font-black tracking-wider">Total Earnings</p>
                      </div>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-1.5 text-[9px] text-slate-505 font-bold mt-2 pt-2 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Exterior Wash</span>
                      <span className="text-slate-800">₹2,45,670 (32.9%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Interior Cleaning</span>
                      <span className="text-slate-800">₹1,65,430 (22.2%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Detailing</span>
                      <span className="text-slate-800">₹1,20,980 (16.2%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Steam Wash</span>
                      <span className="text-slate-800">₹85,640 (11.5%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span>Ceramic Coating</span>
                      <span className="text-slate-800">₹85,210 (8.7%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Others</span>
                      <span className="text-slate-800">₹62,300 (8.3%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Grid (Earnings Trend, Top Earning Services & Summary) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Trend Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-850">Earnings Trend (This Month)</h3>
                    <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>
                  {/* Vertical bar chart graphic */}
                  <div className="relative h-44 w-full flex items-end justify-between px-2 pt-4">
                    {[
                      { week: 'Week 1', val: 121450, max: 200000, label: '₹1.21L' },
                      { week: 'Week 2', val: 158230, max: 200000, label: '₹1.58L' },
                      { week: 'Week 3', val: 172890, max: 200000, label: '₹1.72L' },
                      { week: 'Week 4', val: 165430, max: 200000, label: '₹1.65L' },
                      { week: 'Week 5', val: 27230, max: 200000, label: '₹27K' }
                    ].map((bar, barIdx) => (
                      <div key={barIdx} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-[7px] text-slate-400 font-bold">{bar.label}</span>
                        <div className="w-5 bg-slate-100 rounded-t-lg h-28 overflow-hidden relative flex items-end">
                          <div className="bg-blue-600 w-full rounded-t-lg transition-all" style={{ height: `${(bar.val / bar.max) * 100}%` }}></div>
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold mt-1 whitespace-nowrap">{bar.week}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Earning Services Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-855">Top Earning Services</h3>
                      <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                        <option>This Month</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-wider">
                            <th className="pb-2.5">Service</th>
                            <th className="pb-2.5 text-center">Bookings</th>
                            <th className="pb-2.5">Earnings (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {[
                            { name: 'Exterior Wash', bookings: 356, val: '₹2,45,670', percent: 85, color: 'bg-blue-600' },
                            { name: 'Interior Cleaning', bookings: 298, val: '₹1,65,430', percent: 65, color: 'bg-emerald-500' },
                            { name: 'Detailing', bookings: 187, val: '₹1,20,980', percent: 45, color: 'bg-purple-500' },
                            { name: 'Steam Wash', bookings: 132, val: '₹85,640', percent: 30, color: 'bg-yellow-500' },
                            { name: 'Ceramic Coating', bookings: 96, val: '₹65,210', percent: 20, color: 'bg-cyan-500' }
                          ].map((svc, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2 flex flex-col">
                                <span className="font-bold text-slate-800 leading-tight">{svc.name}</span>
                                <div className="w-16 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                                  <div className={`${svc.color} h-1 rounded-full`} style={{ width: `${svc.percent}%` }}></div>
                                </div>
                              </td>
                              <td className="py-2 text-center font-bold text-slate-650">{svc.bookings}</td>
                              <td className="py-2 font-black text-slate-700">{svc.val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-xs text-slate-500 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="flex items-center gap-1.5"><span>📋</span> Total Bookings</span>
                        <span className="text-slate-850 font-black">1,145</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="flex items-center gap-1.5"><span>📈</span> Total Revenue</span>
                        <span className="text-slate-855 font-black">₹7,45,230</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="flex items-center gap-1.5"><span>📉</span> Total Expenses</span>
                        <span className="text-slate-855 font-black">₹3,16,920</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="flex items-center gap-1.5"><span>🏦</span> Net Profit</span>
                        <span className="text-emerald-600 font-black">₹4,28,310</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><span>%</span> Profit Margin</span>
                        <span className="text-blue-650 font-black">57.44%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Guide Footer */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Earnings and profit data is calculated after deducting commission, taxes and other charges.
                </div>
                <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                  📥 Download Report
                </button>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Payment & Earnings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Wallet</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Wallet</h2>
                  <p className="text-xs text-slate-550 mt-1">Manage your wallet balance, withdraw funds and track settlements.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>➕</span> Withdraw
                  </button>
                  <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>⚙️</span> Wallet Settings
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Balance</span>
                    <p className="text-2xl font-black text-slate-805 mt-1">₹1,24,560.00</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +12.6% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    💳
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Earnings (This Month)</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">₹7,45,230.00</p>
                    <button className="text-[9px] text-blue-600 font-bold mt-2 block hover:text-blue-500">View Earnings Dashboard →</button>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                    📈
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Withdrawn (This Month)</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">₹5,80,670.00</p>
                    <button className="text-[9px] text-blue-600 font-bold mt-2 block hover:text-blue-500">View Withdraw History →</button>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-xl shadow-sm">
                    💵
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Settlement</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">₹75,430.00</p>
                    <p className="text-[9px] text-slate-455 mt-2 font-semibold">Will be settled on 30 May 2025</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>
              </div>

              {/* Middle Grid (Revenue Analytics & Settlement History) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Analytics Chart Card */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black text-slate-850">Revenue Analytics</h3>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">This Month vs Last Month</p>
                      </div>
                      <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                        <option>This Month</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-505 mb-4">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>This Month (₹)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Last Month (₹)</span>
                    </div>

                    {/* Chart Graphic Visual */}
                    <div className="relative h-48 w-full flex items-end">
                      <svg className="w-full h-full text-blue-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                        <path d="M5 28 L 20 22 L 35 20 L 50 16 L 65 10 L 95 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <svg className="absolute inset-0 w-full h-full text-emerald-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                        <path d="M5 38 L 20 32 L 35 29 L 50 24 L 65 20 L 95 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>

                      <div className="absolute inset-0 flex flex-col justify-between text-[7px] text-slate-400 font-bold items-start py-2">
                        <span>1.2L</span>
                        <span>1L</span>
                        <span>80K</span>
                        <span>60K</span>
                        <span>40K</span>
                        <span>20K</span>
                        <span>0</span>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 flex justify-between text-[7px] text-slate-400 font-bold px-3 pt-1">
                        <span>01 May</span>
                        <span>06 May</span>
                        <span>11 May</span>
                        <span>16 May</span>
                        <span>21 May</span>
                        <span>26 May</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom metrics row */}
                  <div className="grid grid-cols-4 gap-4 pt-5 mt-4 border-t border-slate-100 text-center">
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Total Revenue</p>
                      <p className="text-xs font-black text-slate-800 mt-1">₹7,45,230</p>
                      <span className="text-[8px] text-emerald-600 font-bold">↑ 22.3%</span>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Service Commission</p>
                      <p className="text-xs font-black text-slate-800 mt-1">₹1,12,780</p>
                      <span className="text-[8px] text-emerald-600 font-bold">↑ 18.7%</span>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Other Income</p>
                      <p className="text-xs font-black text-slate-800 mt-1">₹28,450</p>
                      <span className="text-[8px] text-emerald-600 font-bold">↑ 12.1%</span>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Net Earnings</p>
                      <p className="text-xs font-black text-emerald-600 mt-1">₹6,03,000</p>
                      <span className="text-[8px] text-emerald-600 font-bold">↑ 20.5%</span>
                    </div>
                  </div>
                </div>

                {/* Settlement History Card */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-850">Settlement History</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-wider">
                            <th className="pb-2.5">Settlement ID</th>
                            <th className="pb-2.5">Date</th>
                            <th className="pb-2.5">Amount</th>
                            <th className="pb-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {[
                            { id: 'SET-2025-0526-001', dt: '26 May 2025', amt: '₹85,430.00', status: 'Pending', badge: 'bg-amber-50 text-amber-600' },
                            { id: 'SET-2025-0519-002', dt: '19 May 2025', amt: '₹92,650.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { id: 'SET-2025-0512-003', dt: '12 May 2025', amt: '₹1,05,230.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { id: 'SET-2025-0505-004', dt: '05 May 2025', amt: '₹1,12,430.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { id: 'SET-2025-0428-005', dt: '28 Apr 2025', amt: '₹95,670.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { id: 'SET-2025-0421-006', dt: '21 Apr 2025', amt: '₹98,320.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { id: 'SET-2025-0414-007', dt: '14 Apr 2025', amt: '₹1,00,540.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' }
                          ].map((setRow, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 font-bold text-slate-800">{setRow.id}</td>
                              <td className="py-2.5 font-semibold text-slate-500">{setRow.dt}</td>
                              <td className="py-2.5 font-black text-slate-800">{setRow.amt}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${setRow.badge}`}>{setRow.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Settlement footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold mt-2">
                    <span>Showing 1 to 7 of 15 settlements</span>
                    <div className="flex items-center gap-1">
                      <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded transition-all cursor-pointer">1</button>
                      <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all cursor-pointer">2</button>
                      <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all cursor-pointer">3</button>
                      <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Grid (Recent Transactions & Wallet Summary) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Transactions Panel */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-850">Recent Transactions</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                            <th className="pb-2.5 px-3">Date & Time</th>
                            <th className="pb-2.5 px-3">Type</th>
                            <th className="pb-2.5 px-3">Description</th>
                            <th className="pb-2.5 px-3">Amount</th>
                            <th className="pb-2.5 px-3">Balance</th>
                            <th className="pb-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {[
                            { dt: '26 May 2025, 10:35 AM', type: 'Earning', desc: 'Booking #BK-2025-1867', typeColor: 'text-emerald-600 bg-emerald-50', amt: '+ ₹1,250.00', bal: '₹1,24,560.00', status: 'Success', badge: 'bg-emerald-50 text-emerald-600' },
                            { dt: '26 May 2025, 09:20 AM', type: 'Earning', desc: 'Booking #BK-2025-1866', typeColor: 'text-emerald-600 bg-emerald-50', amt: '+ ₹890.00', bal: '₹1,23,310.00', status: 'Success', badge: 'bg-emerald-50 text-emerald-600' },
                            { dt: '25 May 2025, 11:15 PM', type: 'Withdrawal', desc: 'To Bank A/c ****5678', typeColor: 'text-rose-600 bg-rose-50', amt: '- ₹20,000.00', bal: '₹1,22,420.00', status: 'Completed', badge: 'bg-emerald-50 text-emerald-600' },
                            { dt: '25 May 2025, 06:45 PM', type: 'Earning', desc: 'Booking #BK-2025-1855', typeColor: 'text-emerald-600 bg-emerald-50', amt: '+ ₹1,540.00', bal: '₹1,42,420.00', status: 'Success', badge: 'bg-emerald-50 text-emerald-600' },
                            { dt: '25 May 2025, 02:30 PM', type: 'Earning', desc: 'Booking #BK-2025-1864', typeColor: 'text-emerald-600 bg-emerald-50', amt: '+ ₹1,120.00', bal: '₹1,40,880.00', status: 'Success', badge: 'bg-emerald-50 text-emerald-600' }
                          ].map((txRow, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-500">{txRow.dt}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${txRow.typeColor}`}>{txRow.type}</span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">{txRow.desc}</td>
                              <td className="py-2.5 px-3 font-black text-slate-800">{txRow.amt}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-650">{txRow.bal}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${txRow.badge}`}>{txRow.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Wallet Summary Card */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-xs text-slate-505 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-wide mb-4 pb-2 border-b border-slate-100">Wallet Summary</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span>Current Balance</span>
                        <span className="text-slate-850 font-black">₹1,24,560.00</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span>Withdrawable Amount</span>
                        <span className="text-slate-850 font-black">₹1,24,560.00</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span>Minimum Withdrawal Limit</span>
                        <span className="text-slate-850 font-bold">₹500.00</span>
                      </div>
                      <div className="flex justify-between items-start border-b border-slate-50 pb-1.5">
                        <div>
                          <span>Preferred Bank Account</span>
                          <span className="text-slate-800 font-bold block mt-1">**** **** **** 5678</span>
                          <span className="text-slate-400 font-semibold block mt-0.5 text-[10px]">HDFC Bank - Roy Motors</span>
                        </div>
                        <button className="text-[10px] text-blue-600 hover:text-blue-500 font-bold mt-1.5">Change</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span>Last Withdrawal</span>
                          <span className="text-slate-800 font-bold block mt-1">25 May 2025</span>
                        </div>
                        <button className="text-[10px] text-blue-600 hover:text-blue-500 font-bold mt-1">View History</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Withdrawals are processed within 24-48 hours on business days.
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Payment & Earnings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Transactions</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Transactions</h2>
                  <p className="text-xs text-slate-555 mt-1">View all payment transactions and their current status.</p>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Transactions</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">1,248</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +18.4% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    🔄
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Successful Transactions</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">1,068</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">85.6% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                    ✓
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Transactions</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">112</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">9.0% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Failed Transactions</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">68</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">5.4% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-xl shadow-sm">
                    ✕
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by Transaction ID or Customer name..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                      <option>01 May 2025 - 26 May 2025</option>
                    </select>
                  </div>

                  <select className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                    <option>Success</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📥 Export
                  </button>
                </div>
              </div>

              {/* Transactions Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Transaction ID</th>
                        <th className="py-4.5 px-4">Customer</th>
                        <th className="py-4.5 px-4">Amount</th>
                        <th className="py-4.5 px-4">Payment Mode</th>
                        <th className="py-4.5 px-4">Date & Time</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { id: 'TRX-2025-0526-001', cust: 'Rahul Sharma', phone: '+91 98765 43210', amt: '₹1,250.00', mode: 'UPI', date: '26 May 2025, 10:35 AM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0526-002', cust: 'Priya Verma', phone: '+91 87654 32109', amt: '₹2,800.00', mode: 'Credit Card', date: '26 May 2025, 09:20 AM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-018', cust: 'Amit Gupta', phone: '+91 76543 21098', amt: '₹950.00', mode: 'UPI', date: '25 May 2025, 08:45 PM', status: 'Pending', badge: 'bg-amber-50 text-amber-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-017', cust: 'Neha Singh', phone: '+91 65432 10987', amt: '₹1,600.00', mode: 'Net Banking', date: '25 May 2025, 07:30 PM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-016', cust: 'Vikram Patel', phone: '+91 54321 09876', amt: '₹3,420.00', mode: 'Debit Card', date: '25 May 2025, 06:15 PM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-015', cust: 'Karan Mehta', phone: '+91 43210 98765', amt: '₹750.00', mode: 'UPI', date: '25 May 2025, 05:05 PM', status: 'Failed', badge: 'bg-rose-50 text-rose-600', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-014', cust: 'Sneha Reddy', phone: '+91 32109 87654', amt: '₹1,125.00', mode: 'Wallet', date: '25 May 2025, 04:20 PM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-013', cust: 'Manish Kumar', phone: '+91 21098 76543', amt: '₹2,200.00', mode: 'Credit Card', date: '25 May 2025, 03:40 PM', status: 'Pending', badge: 'bg-amber-50 text-amber-600', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-012', cust: 'Pooja Iyer', phone: '+91 10987 65432', amt: '₹650.00', mode: 'UPI', date: '25 May 2025, 02:30 PM', status: 'Failed', badge: 'bg-rose-50 text-rose-600', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=60' },
                        { id: 'TRX-2025-0525-011', cust: 'Sagar Joshi', phone: '+91 09876 54321', amt: '₹1,900.00', mode: 'Net Banking', date: '25 May 2025, 01:15 PM', status: 'Success', badge: 'bg-emerald-50 text-emerald-600', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=60' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-blue-600">{item.id}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                                <img src={item.avatar} alt={item.cust} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.cust}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{item.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-black text-slate-800">{item.amt}</td>
                          <td className="py-4 px-4 font-bold text-slate-550 flex items-center gap-1.5 mt-2">
                            <span>💳</span> {item.mode}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.date}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.badge}`}>{item.status}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg shadow-sm">
                              ⋮
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-slate-50/30">
                  <span>Showing 1 to 10 of 1,248 transactions</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">...</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">125</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Payment & Earnings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Invoice Management</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Invoice Management</h2>
                  <p className="text-xs text-slate-555 mt-1">Manage and track all your invoices in one place.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>➕</span> Create Invoice
                  </button>
                  <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-55 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>📥</span> Export Invoices
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invoices</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">1,248</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">This Month</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-lg shadow-sm">
                    📋
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paid Invoices</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">952</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">76.3%</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-lg shadow-sm">
                    ✓
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Invoices</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">241</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">19.3%</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-lg shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overdue Invoices</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">55</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">4.4%</p>
                  </div>
                  <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-lg shadow-sm">
                    ⚠️
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue</span>
                    <p className="text-[15px] font-black text-slate-855 mt-2">₹24,58,320.00</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5">This Month</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-lg shadow-sm">
                    ₹
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by Invoice Number or Customer..."
                      className="w-full rounded-xl bg-slate-55 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-550/20 cursor-pointer">
                      <option>01 May 2025 - 26 May 2025</option>
                    </select>
                  </div>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                </div>
              </div>

              {/* Invoices Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Invoice Number</th>
                        <th className="py-4.5 px-4">Customer</th>
                        <th className="py-4.5 px-4">Invoice Date</th>
                        <th className="py-4.5 px-4">Due Date</th>
                        <th className="py-4.5 px-4">Amount</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { id: 'INV-2025-0526-001', svc: 'Car Wash Service', cust: 'Rahul Sharma', phone: '+91 98765 43210', initial: 'RS', bg: 'bg-blue-50 text-blue-600', date: '26 May 2025', due: '02 Jun 2025', amt: '₹2,450.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' },
                        { id: 'INV-2025-0526-002', svc: 'Interior Cleaning', cust: 'Priya Verma', phone: '+91 87654 32109', initial: 'PV', bg: 'bg-purple-50 text-purple-600', date: '26 May 2025', due: '02 Jun 2025', amt: '₹4,750.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' },
                        { id: 'INV-2025-0525-018', svc: 'Exterior Wash', cust: 'Amit Gupta', phone: '+91 76543 21098', initial: 'AG', bg: 'bg-blue-50 text-blue-600', date: '25 May 2025', due: '01 Jun 2025', amt: '₹850.00', status: 'Pending', badge: 'bg-amber-50 text-amber-600' },
                        { id: 'INV-2025-0525-017', svc: 'Full Car Detailing', cust: 'Neha Singh', phone: '+91 65432 10987', initial: 'NS', bg: 'bg-purple-50 text-purple-600', date: '25 May 2025', due: '01 Jun 2025', amt: '₹6,250.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' },
                        { id: 'INV-2025-0525-016', svc: 'Steam Wash', cust: 'Vikram Patel', phone: '+91 54321 09876', initial: 'VP', bg: 'bg-yellow-50 text-yellow-600', date: '25 May 2025', due: '01 Jun 2025', amt: '₹1,950.00', status: 'Overdue', badge: 'bg-rose-50 text-rose-600' },
                        { id: 'INV-2025-0524-014', svc: 'Interior + Exterior', cust: 'Karan Mehta', phone: '+91 43210 98765', initial: 'KM', bg: 'bg-blue-50 text-blue-600', date: '24 May 2025', due: '31 May 2025', amt: '₹3,150.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' },
                        { id: 'INV-2025-0524-013', svc: 'Ceramic Coating', cust: 'Sneha Reddy', phone: '+91 32109 87654', initial: 'SR', bg: 'bg-cyan-50 text-cyan-600', date: '24 May 2025', due: '31 May 2025', amt: '₹8,900.00', status: 'Pending', badge: 'bg-amber-50 text-amber-600' },
                        { id: 'INV-2025-0524-012', svc: 'Foam Wash', cust: 'Manish Kumar', phone: '+91 21098 76543', initial: 'MK', bg: 'bg-blue-50 text-blue-600', date: '24 May 2025', due: '31 May 2025', amt: '₹650.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' },
                        { id: 'INV-2025-0523-011', svc: 'Engine Cleaning', cust: 'Pooja Iyer', phone: '+91 10987 65432', initial: 'PI', bg: 'bg-yellow-50 text-yellow-600', date: '23 May 2025', due: '30 May 2025', amt: '₹2,250.00', status: 'Overdue', badge: 'bg-rose-50 text-rose-600' },
                        { id: 'INV-2025-0523-010', svc: 'Windshield Treatment', cust: 'Sagar Joshi', phone: '+91 09876 54321', initial: 'SJ', bg: 'bg-blue-50 text-blue-600', date: '23 May 2025', due: '30 May 2025', amt: '₹1,150.00', status: 'Paid', badge: 'bg-emerald-50 text-emerald-600' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-blue-600 block">{item.id}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.svc}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center font-bold text-xs shadow-sm`}>
                                {item.initial}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.cust}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{item.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.date}</td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.due}</td>
                          <td className="py-4 px-4 font-black text-slate-800">{item.amt}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${item.badge}`}>{item.status}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1">
                                👁️ View
                              </button>
                              <button className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1">
                                📥 Download
                              </button>
                              <button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1">
                                🔗 Share
                              </button>
                              <button className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg shadow-sm">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-550 bg-slate-50/30">
                  <span>Showing 1 to 10 of 1,248 invoices</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">...</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">125</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "offers" && viewCouponManagement && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Back Link & Header */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <button 
                    onClick={() => setViewCouponManagement(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-500 cursor-pointer mb-3 transition-all"
                  >
                    ← Back to Offers Dashboard
                  </button>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Offers & Promotions</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Coupon Management</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Coupon Management</h2>
                  <p className="text-xs text-slate-555 mt-1">Create, manage and track all your coupons.</p>
                </div>
                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  ➕ Create Coupon
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Coupons</span>
                    <p className="text-2xl font-black text-slate-805 mt-1">56</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +12.5% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    📋
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Coupons</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">34</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">60.7% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                    ✓
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Coupons</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">8</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">14.3% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expired Coupons</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">14</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">25.0% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-xl shadow-sm">
                    ✕
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Redemptions</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">2,845</p>
                    <p className="text-[9px] text-purple-600 font-bold mt-1">This Month</p>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-xl shadow-sm">
                    🎟️
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by coupon code or name..."
                      className="w-full rounded-xl bg-slate-55 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  </div>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Coupon Types</option>
                    <option>Flat Discount</option>
                    <option>Percentage</option>
                    <option>Festival Offer</option>
                  </select>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Expired</option>
                    <option>Scheduled</option>
                  </select>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-550/20 cursor-pointer">
                      <option>01 May 2025 - 26 May 2025</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📥 Export
                  </button>
                </div>
              </div>

              {/* Coupons Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Code</th>
                        <th className="py-4.5 px-4">Coupon Name</th>
                        <th className="py-4.5 px-4">Type</th>
                        <th className="py-4.5 px-4">Discount</th>
                        <th className="py-4.5 px-4 text-center">Min. Order</th>
                        <th className="py-4.5 px-4">Expiry Date</th>
                        <th className="py-4.5 px-4 text-center">Usage Count</th>
                        <th className="py-4.5 px-4 text-center">Usage Limit</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { code: 'SUMMER100', name: 'Summer Special 100', desc: 'Flat ₹100 OFF', type: 'Flat Discount', typeBadge: 'bg-blue-50 text-blue-650', amt: '₹100', min: '₹499', exp: '31 May 2025', timeLeft: '5 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 342, limit: '1,000', status: 'Active', badge: 'bg-emerald-50 text-emerald-600' },
                        { code: 'WEEKEND20', name: 'Weekend 20% OFF', desc: '20% OFF on all services', type: 'Percentage', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '20%', min: '₹300', exp: '25 May 2025', timeLeft: 'Expired', timeColor: 'text-rose-600 bg-rose-50/50', count: 487, limit: '1,000', status: 'Expired', badge: 'bg-rose-50 text-rose-600' },
                        { code: 'GOMOTOR50', name: 'GoMotor 50', desc: 'Flat ₹50 OFF', type: 'Flat Discount', typeBadge: 'bg-blue-50 text-blue-650', amt: '₹50', min: '₹299', exp: '15 Jun 2025', timeLeft: '20 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 215, limit: '500', status: 'Active', badge: 'bg-emerald-50 text-emerald-600' },
                        { code: 'FESTIVE25', name: 'Festival 25% Offer', desc: '25% OFF on all services', type: 'Percentage', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '25%', min: '₹500', exp: '05 Jun 2025', timeLeft: '10 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 398, limit: '800', status: 'Active', badge: 'bg-emerald-50 text-emerald-600' },
                        { code: 'DIWALI30', name: 'Diwali Dhamaka', desc: '30% OFF on all services', type: 'Festival Offer', typeBadge: 'bg-amber-50 text-amber-600', amt: '30%', min: '₹600', exp: '10 Nov 2025', timeLeft: '168 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 76, limit: '1,200', status: 'Scheduled', badge: 'bg-blue-50 text-blue-650' },
                        { code: 'NEWUSER15', name: 'New User 15% OFF', desc: '15% OFF for new users', type: 'Percentage', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '15%', min: '₹250', exp: '31 May 2025', timeLeft: '5 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 932, limit: '2,000', status: 'Active', badge: 'bg-emerald-50 text-emerald-600' },
                        { code: 'WELCOME100', name: 'Welcome Bonus 100', desc: 'Flat ₹100 OFF', type: 'Flat Discount', typeBadge: 'bg-blue-50 text-blue-650', amt: '₹100', min: '₹400', exp: '20 May 2025', timeLeft: 'Expired', timeColor: 'text-rose-600 bg-rose-50/50', count: 654, limit: '1,000', status: 'Expired', badge: 'bg-rose-50 text-rose-600' },
                        { code: 'STEAM25', name: 'Steam Wash 25%', desc: '25% OFF on Steam Wash', type: 'Percentage', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '25%', min: '₹350', exp: '30 Jun 2025', timeLeft: '35 days left', timeColor: 'text-[#16A34A] bg-emerald-50/50', count: 141, limit: '600', status: 'Active', badge: 'bg-emerald-50 text-emerald-600' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="px-3 py-1.5 border border-dashed border-blue-300 bg-blue-50/30 text-blue-700 font-bold rounded-lg uppercase tracking-wider text-[10px]">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-800 block leading-tight">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.desc}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.typeBadge}`}>{item.type}</span>
                          </td>
                          <td className="py-4 px-4 font-black text-slate-850">{item.amt}</td>
                          <td className="py-4 px-4 text-center font-bold text-slate-600">{item.min}</td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-800 block">{item.exp}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold mt-0.5 inline-block ${item.timeColor}`}>{item.timeLeft}</span>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-700">{item.count}</td>
                          <td className="py-4 px-4 text-center font-bold text-slate-500">{item.limit}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${item.badge}`}>{item.status}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">👁️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">✏️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">⋮</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-slate-50/30">
                  <span>Showing 1 to 8 of 56 coupons</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">4</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">5</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">6</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Guide Footer */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-650 flex items-center gap-1.5">
                  ℹ️ Coupons are applied at checkout and not combined with other offers.
                </div>
              </div>
            </div>
          )}

          {activeTab === "offers" && !viewCouponManagement && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Offers & Promotions</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Offers Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Offers Dashboard</h2>
                  <p className="text-xs text-slate-555 mt-1">Create, manage and track all offers and promotions.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewCouponManagement(true)}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    🎫 Coupon Management
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    ➕ Create Offer
                  </button>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Offers</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">32</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +14.3% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    🏷️
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Offers</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">18</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">56.3% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                    🎁
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Offers</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">7</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">21.9% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expired Offers</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">7</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">21.9% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-xl shadow-sm">
                    ✕
                  </div>
                </div>
              </div>

              {/* Offer Types Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-lg shadow-sm">
                      🎟️
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850">Flat Discount</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Give a fixed amount discount on services.</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-650 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                    Create Flat Discount
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-lg shadow-sm">
                      %
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-855">Percentage Discount</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Give percentage based discount on services.</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-655 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                    Create Percentage Discount
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-lg shadow-sm">
                      🎫
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850">Coupon</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Create coupon codes for customers.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewCouponManagement(true)}
                    className="w-full py-2 bg-white border border-purple-200 hover:bg-purple-50 text-purple-650 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                  >
                    Create Coupon
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-650 text-lg shadow-sm">
                      💥
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850">Festival Offer</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Special offers for festivals and special occasions.</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                    Create Festival Offer
                  </button>
                </div>
              </div>

              {/* Middle Grid (Recent Offers & Offers Status Overview) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Offers Card */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-850">Recent Offers</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All Offers</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-wider">
                            <th className="pb-2.5 px-3">Offer Name</th>
                            <th className="pb-2.5 px-3">Offer Type</th>
                            <th className="pb-2.5 px-3">Discount</th>
                            <th className="pb-2.5 px-3">Target</th>
                            <th className="pb-2.5 px-3">Validity Period</th>
                            <th className="pb-2.5 px-3 text-center">Status</th>
                            <th className="pb-2.5 px-3">Created On</th>
                            <th className="pb-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {[
                            { name: 'Summer Special Flat 100', type: 'Flat Discount', typeBadge: 'bg-blue-50 text-blue-650', amt: '₹100', target: 'All Services', val: '20 May 2025 - 31 May 2025', status: 'Active', badge: 'bg-emerald-50 text-emerald-600', created: '20 May 2025' },
                            { name: 'Weekend 20% OFF', type: 'Percentage Discount', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '20%', target: 'Exterior Wash', val: '23 May 2025 - 25 May 2025', status: 'Active', badge: 'bg-emerald-50 text-emerald-600', created: '23 May 2025' },
                            { name: 'GOMOTOR50', type: 'Coupon', typeBadge: 'bg-purple-50 text-purple-650', amt: '₹50', target: 'Min. Order ₹300', val: '15 May 2025 - 15 Jun 2025', status: 'Active', badge: 'bg-emerald-50 text-emerald-600', created: '15 May 2025' },
                            { name: 'Diwali Dhamaka', type: 'Festival Offer', typeBadge: 'bg-amber-50 text-amber-600', amt: '30%', target: 'All Services', val: '25 Oct 2025 - 05 Nov 2025', status: 'Scheduled', badge: 'bg-blue-50 text-blue-650', created: '24 May 2025' },
                            { name: 'Flat 150 OFF', type: 'Flat Discount', typeBadge: 'bg-blue-50 text-blue-655', amt: '₹150', target: 'Interior Cleaning', val: '10 May 2025 - 20 May 2025', status: 'Expired', badge: 'bg-rose-50 text-rose-600', created: '10 May 2025' },
                            { name: 'Monsoon 25% OFF', type: 'Percentage Discount', typeBadge: 'bg-emerald-50 text-emerald-650', amt: '25%', target: 'Steam Wash', val: '01 Jun 2025 - 30 Jun 2025', status: 'Scheduled', badge: 'bg-blue-50 text-blue-650', created: '25 May 2025' },
                            { name: 'NEWUSER100', type: 'Coupon', typeBadge: 'bg-purple-50 text-purple-650', amt: '₹100', target: 'Min. Order ₹500', val: '01 May 2025 - 31 May 2025', status: 'Expired', badge: 'bg-rose-50 text-rose-600', created: '01 May 2025' }
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                                <span>🏷️</span> {row.name}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.typeBadge}`}>{row.type}</span>
                              </td>
                              <td className="py-3 px-3 font-black text-slate-800">{row.amt}</td>
                              <td className="py-3 px-3 font-bold text-slate-500">{row.target}</td>
                              <td className="py-3 px-3 font-semibold text-slate-500">{row.val}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.badge}`}>{row.status}</span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-500">{row.created}</td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button className="p-1 hover:bg-slate-100 rounded text-slate-500">👁️</button>
                                  <button className="p-1 hover:bg-slate-100 rounded text-slate-500">✏️</button>
                                  <button className="p-1 hover:bg-slate-100 rounded text-slate-400">⋮</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold mt-2">
                      <span>Showing 1 to 7 of 32 offers</span>
                      <div className="flex items-center gap-1">
                        <select className="border border-slate-200 rounded px-1 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[10px] mr-2">
                          <option>10 per page</option>
                        </select>
                        <button className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-55 transition-all cursor-pointer">‹</button>
                        <button className="px-2.5 py-1 bg-blue-600 text-white rounded transition-all cursor-pointer">1</button>
                        <button className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-55 transition-all cursor-pointer">2</button>
                        <button className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-55 transition-all cursor-pointer">3</button>
                        <button className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-55 transition-all cursor-pointer">4</button>
                        <button className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-55 transition-all cursor-pointer">›</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panels Column (Status Overview & Top Performing) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Offers Status Overview Donut */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-64">
                    <h3 className="text-sm font-black text-slate-850 pb-2 border-b border-slate-100">Offers Status Overview</h3>
                    <div className="flex items-center justify-between py-2">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {/* Active (56.3%) - Green */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="56.3 43.7" strokeDashoffset="0" />
                          {/* Scheduled (21.9%) - Blue */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="21.9 78.1" strokeDashoffset="-56.3" />
                          {/* Expired (21.9%) - Red */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="21.9 78.1" strokeDashoffset="-78.2" />
                        </svg>
                        <div className="absolute text-center">
                          <p className="text-lg font-black text-slate-800">32</p>
                          <p className="text-[6.5px] text-slate-400 uppercase font-black tracking-wider">Total Offers</p>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div className="space-y-2 text-[9px] text-slate-505 font-bold pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Active: 18 (56.3%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>Scheduled: 7 (21.9%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span>Expired: 7 (21.9%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Offers */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-850">Top Performing Offers</h3>
                        <button className="text-[10px] text-blue-600 hover:text-blue-500 font-bold border border-blue-200 px-2 py-0.5 rounded-lg shadow-sm">View Report</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-wider">
                              <th className="pb-2">Offer Name</th>
                              <th className="pb-2 text-center">Redemptions</th>
                              <th className="pb-2">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700">
                            {[
                              { name: 'Weekend 20% OFF', count: 245, rev: '₹1,24,560' },
                              { name: 'GOMOTOR50', count: 198, rev: '₹98,750' },
                              { name: 'Summer Special Flat 100', count: 156, rev: '₹78,300' },
                              { name: 'Diwali Dhamaka', count: 132, rev: '₹65,450' },
                              { name: 'NEWUSER100', count: 98, rev: '₹48,620' }
                            ].map((topRow, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 font-bold text-slate-800 flex items-center gap-1">
                                  <span>%</span> {topRow.name}
                                </td>
                                <td className="py-2.5 text-center font-bold text-slate-600">{topRow.count}</td>
                                <td className="py-2.5 font-black text-slate-800">{topRow.rev}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Guide Footer */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Create smart offers and boost your bookings. Track performance and maximize your revenue.
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Ratings & Reviews</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Ratings Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Ratings Dashboard</h2>
                  <p className="text-xs text-slate-555 mt-1">Track your overall ratings, reviews and customer feedback.</p>
                </div>
                <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  📥 Export Report
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rating</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-2xl font-black text-slate-800">4.6</p>
                      <span className="text-amber-500 text-xs">★★★★★</span>
                    </div>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 0.3 vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl shadow-sm">
                    ⭐
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reviews</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">1,248</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">↑ 18.7% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    💬
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Review Trend</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-2xl font-black text-slate-855">↑ 22.4%</p>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-650">Positive</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-xl shadow-sm">
                    📈
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Customers Reviewed</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">982</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 16.2% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    👥
                  </div>
                </div>
              </div>

              {/* Middle Grid (Trend & Breakdown Left, Reviews Feed Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Analytics Column */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Review Trend Line Chart */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-72">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black text-slate-855">Review Trend</h3>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Average rating over time</p>
                      </div>
                      <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                        <option>Last 6 Months</option>
                      </select>
                    </div>

                    <div className="relative h-44 w-full flex items-end">
                      <svg className="w-full h-full text-purple-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                        <path d="M5 38 L 20 34 L 35 30 L 50 26 L 65 22 L 95 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M5 38 L 20 34 L 35 30 L 50 26 L 65 22 L 95 18 L 95 50 L 5 50 Z" fill="url(#trend-gradient)" opacity="0.05" />
                        <defs>
                          <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Chart values */}
                      <div className="absolute inset-0 flex flex-col justify-between text-[7px] text-slate-400 font-bold items-start py-2">
                        <span>5.0</span>
                        <span>4.0</span>
                        <span>3.0</span>
                        <span>2.0</span>
                        <span>1.0</span>
                        <span>0</span>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 flex justify-between text-[7px] text-slate-400 font-bold px-3 pt-1">
                        <span>Dec 2024</span>
                        <span>Jan 2025</span>
                        <span>Feb 2025</span>
                        <span>Mar 2025</span>
                        <span>Apr 2025</span>
                        <span>May 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Ratings Breakdown & Top Review Categories Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Ratings Breakdown Donut Chart */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[280px]">
                      <h4 className="text-xs font-black text-slate-850 pb-2 border-b border-slate-100">Ratings Breakdown</h4>
                      <div className="flex flex-col items-center py-2">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="59.5 40.5" strokeDashoffset="0" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="25.0 75.0" strokeDashoffset="-59.5" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EAB308" strokeWidth="4" strokeDasharray="10.3 89.7" strokeDashoffset="-84.5" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F97316" strokeWidth="4" strokeDasharray="3.0 97.0" strokeDashoffset="-94.8" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="2.2 97.8" strokeDashoffset="-97.8" />
                          </svg>
                          <div className="absolute text-center">
                            <p className="text-xs font-black text-slate-800">1,248</p>
                            <p className="text-[5px] text-slate-400 uppercase font-black tracking-wider">Reviews</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[8px] text-slate-505 font-bold pt-2 border-t border-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>5 Star</span>
                          <span className="text-slate-800">742 (59.5%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>4 Star</span>
                          <span className="text-slate-800">312 (25.0%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>3 Star</span>
                          <span className="text-slate-800">128 (10.3%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>2 Star</span>
                          <span className="text-slate-800">38 (3.0%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>1 Star</span>
                          <span className="text-slate-800">28 (2.2%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Review Categories list */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[280px]">
                      <h4 className="text-xs font-black text-slate-850 pb-2 border-b border-slate-100">Top Review Categories</h4>
                      <div className="space-y-3.5 text-[9px] text-slate-600 font-bold pt-1">
                        {[
                          { name: 'Exterior Wash', count: '482', pct: '38.6%' },
                          { name: 'Interior Cleaning', count: '312', pct: '25.0%' },
                          { name: 'Steam Wash', count: '238', pct: '19.3%' },
                          { name: 'Full Detailing', count: '146', pct: '11.7%' },
                          { name: 'Express Service', count: '70', pct: '5.6%' }
                        ].map((catRow, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-slate-800">{catRow.name}</span>
                            <span className="text-slate-400 font-semibold">{catRow.count} ({catRow.pct})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Reviews Feed Card */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-850">Customer Reviews Feed</h3>
                      <div className="flex gap-2">
                        <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                          <option>All Ratings</option>
                        </select>
                        <select className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                          <option>Latest First</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: 'Rahul Sharma', star: '★★★★★', starCount: '5.0', badge: 'bg-emerald-50 text-emerald-600', date: '26 May 2025', comment: 'Excellent service! My car was cleaned perfectly. Staff was professional and on time.', tags: ['Exterior Wash', 'Express Service'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { name: 'Priya Verma', star: '★★★★½', starCount: '4.5', badge: 'bg-emerald-50 text-emerald-600', date: '25 May 2025', comment: 'Good service and friendly staff. Will definitely come again.', tags: ['Interior Cleaning', 'Premium Package'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60' },
                        { name: 'Amit Gupta', star: '★★★★★', starCount: '5.0', badge: 'bg-emerald-50 text-emerald-600', date: '24 May 2025', comment: 'Very satisfied with the steam wash. My car looks brand new!', tags: ['Steam Wash'], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60' },
                        { name: 'Neha Singh', star: '★★★★☆', starCount: '4.0', badge: 'bg-amber-50 text-amber-600', date: '23 May 2025', comment: 'Good service but a little delay in pickup.', tags: ['Exterior Wash'], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60' },
                        { name: 'Vikram Patel', star: '★★★☆☆', starCount: '3.0', badge: 'bg-amber-50 text-amber-600', date: '22 May 2025', comment: 'Service was average. Could be better.', tags: ['Full Detailing'], avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=60' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex gap-3 text-xs">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center flex-shrink-0">
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-amber-500 text-[10px]">{item.star}</span>
                                  <span className="text-[9px] text-slate-405 font-bold">{item.date}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${item.badge}`}>{item.starCount}</span>
                                <button className="p-1 hover:bg-slate-100 rounded text-slate-400">⋮</button>
                              </div>
                            </div>
                            <p className="text-slate-650 leading-relaxed font-semibold mt-1">{item.comment}</p>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {item.tags.map((tg, tgIdx) => (
                                <span key={tgIdx} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase">{tg}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="text-xs text-blue-600 hover:text-blue-500 font-black text-center mt-4 pt-3 border-t border-slate-100">
                    View All Reviews →
                  </button>
                </div>
              </div>

              {/* Status Guide Footer */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Keep up the good work! 🎉 Your ratings are higher than 82% of similar businesses.
                </div>
              </div>
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Complaint Management</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Complaint Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Complaint Dashboard</h2>
                  <p className="text-xs text-slate-555 mt-1">Track and manage all complaints raised by customers.</p>
                </div>
                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  ➕ Raise New Complaint
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Complaints</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">325</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ +15.6% vs last month</p>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-xl shadow-sm">
                    📋
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Complaints</span>
                    <p className="text-2xl font-black text-slate-850 mt-1">86</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">26.5% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Complaints</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">112</p>
                    <p className="text-[9px] text-amber-500 font-bold mt-1">34.5% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-xl shadow-sm">
                    ⌛
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Closed Complaints</span>
                    <p className="text-2xl font-black text-slate-855 mt-1">127</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">39.0% of total</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-xl shadow-sm">
                    ✓
                  </div>
                </div>
              </div>

              {/* Middle Grid (Complaint Categories & Complaints by Status) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Complaint Categories Card */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <h3 className="text-sm font-black text-slate-850 pb-2 border-b border-slate-100 mb-4">Complaint Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-1">
                      <span className="text-xl">👥</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                      <p className="text-xl font-black text-slate-800">148</p>
                      <p className="text-[9px] text-purple-600 font-bold">45.5%</p>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-1">
                      <span className="text-xl">💳</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Payment</p>
                      <p className="text-xl font-black text-slate-800">72</p>
                      <p className="text-[9px] text-blue-600 font-bold">22.2%</p>
                    </div>

                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-center space-y-1">
                      <span className="text-xl">📦</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Inventory</p>
                      <p className="text-xl font-black text-slate-800">56</p>
                      <p className="text-[9px] text-amber-600 font-bold">17.2%</p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-1">
                      <span className="text-xl">⚙️</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Technical</p>
                      <p className="text-xl font-black text-slate-800">49</p>
                      <p className="text-[9px] text-emerald-600 font-bold">15.1%</p>
                    </div>
                  </div>
                </div>

                {/* Complaints by Status Donut */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <h3 className="text-sm font-black text-slate-850 pb-2 border-b border-slate-100">Complaints by Status</h3>
                  <div className="flex items-center justify-between py-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Open (26.5%) - Orange/Yellow */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EAB308" strokeWidth="4" strokeDasharray="26.5 73.5" strokeDashoffset="0" />
                        {/* Pending (34.5%) - Orange */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F97316" strokeWidth="4" strokeDasharray="34.5 65.5" strokeDashoffset="-26.5" />
                        {/* Closed (39.0%) - Blue */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="39.0 61.0" strokeDashoffset="-61.0" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-sm font-black text-slate-800">325</p>
                        <p className="text-[6.5px] text-slate-400 uppercase font-black tracking-wider">Total</p>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 text-[9px] text-slate-505 font-bold pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span>Open: 86 (26.5%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Pending: 112 (34.5%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Closed: 127 (39.0%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative min-w-[280px]">
                    <input 
                      type="text" 
                      placeholder="Search by Complaint ID, Customer or Subject..."
                      className="w-full rounded-xl bg-slate-55 border border-slate-200 text-slate-800 placeholder-slate-400 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  </div>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Categories</option>
                    <option>Customer</option>
                    <option>Payment</option>
                    <option>Inventory</option>
                    <option>Technical</option>
                  </select>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Status</option>
                    <option>Open</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-550/20 cursor-pointer">
                      <option>01 May 2025 - 26 May 2025</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filters
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📥 Export
                  </button>
                </div>
              </div>

              {/* Complaints Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Complaint ID</th>
                        <th className="py-4.5 px-4">Customer</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4">Subject</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Priority</th>
                        <th className="py-4.5 px-4">Date</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { id: 'CMP-2025-0526-001', cust: 'Rahul Sharma', phone: '+91 98765 43210', cat: 'Customer', catBadge: 'bg-purple-50 text-purple-650', sub: 'Poor service experience', status: 'Open', statusBadge: 'bg-yellow-50 text-yellow-600', priority: 'High', priorityBadge: 'bg-rose-50 text-rose-600', dt: '26 May 2025, 10:30 AM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0526-002', cust: 'Priya Verma', phone: '+91 87654 32109', cat: 'Payment', catBadge: 'bg-blue-50 text-blue-650', sub: 'Payment not refunded', status: 'Pending', statusBadge: 'bg-orange-50 text-orange-600', priority: 'Medium', priorityBadge: 'bg-amber-50 text-amber-600', dt: '26 May 2025, 09:20 AM', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-018', cust: 'Amit Gupta', phone: '+91 76543 21098', cat: 'Inventory', catBadge: 'bg-amber-50 text-amber-600', sub: 'Item out of stock', status: 'Pending', statusBadge: 'bg-orange-50 text-orange-600', priority: 'Medium', priorityBadge: 'bg-amber-50 text-amber-600', dt: '25 May 2025, 08:45 PM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-017', cust: 'Neha Singh', phone: '+91 65432 10987', cat: 'Technical', catBadge: 'bg-emerald-50 text-emerald-650', sub: 'App not working', status: 'Open', statusBadge: 'bg-yellow-50 text-yellow-600', priority: 'High', priorityBadge: 'bg-rose-50 text-rose-600', dt: '25 May 2025, 07:30 PM', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-016', cust: 'Vikram Patel', phone: '+91 54321 09876', cat: 'Customer', catBadge: 'bg-purple-50 text-purple-650', sub: 'Staff behavior issue', status: 'Closed', statusBadge: 'bg-blue-50 text-blue-600', priority: 'Low', priorityBadge: 'bg-emerald-50 text-emerald-650', dt: '25 May 2025, 06:15 PM', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-015', cust: 'Karan Mehta', phone: '+91 43210 98765', cat: 'Payment', catBadge: 'bg-blue-50 text-blue-650', sub: 'Double payment deducted', status: 'Closed', statusBadge: 'bg-blue-50 text-blue-600', priority: 'Low', priorityBadge: 'bg-emerald-50 text-emerald-650', dt: '25 May 2025, 05:05 PM', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-014', cust: 'Sneha Reddy', phone: '+91 32109 87654', cat: 'Inventory', catBadge: 'bg-amber-50 text-amber-600', sub: 'Received wrong product', status: 'Pending', statusBadge: 'bg-orange-50 text-orange-600', priority: 'Medium', priorityBadge: 'bg-amber-50 text-amber-600', dt: '25 May 2025, 04:20 PM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60' },
                        { id: 'CMP-2025-0525-013', cust: 'Manish Kumar', phone: '+91 21098 76543', cat: 'Technical', catBadge: 'bg-emerald-50 text-emerald-655', sub: 'Login issue in app', status: 'Closed', statusBadge: 'bg-blue-50 text-blue-600', priority: 'Low', priorityBadge: 'bg-emerald-50 text-emerald-655', dt: '25 May 2025, 03:40 PM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-blue-600">{item.id}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center">
                                <img src={item.avatar} alt={item.cust} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.cust}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{item.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.catBadge}`}>{item.cat}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">{item.sub}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.statusBadge}`}>{item.status}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.priorityBadge}`}>{item.priority}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.dt}</td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">👁️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">✏️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">⋮</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-slate-50/30">
                  <span>Showing 1 to 8 of 325 complaints</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">4</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">5</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">...</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">33</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Reports</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Reports Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Reports Dashboard</h2>
                  <p className="text-xs text-slate-555 mt-1">View and analyze your business performance with detailed reports.</p>
                </div>
                
                {/* Export Report Buttons */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-right mb-1">Export Report</span>
                  <div className="flex gap-2">
                    <button className="px-3.5 py-2 bg-white border border-rose-250 hover:bg-rose-50/50 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1">
                      📄 PDF
                    </button>
                    <button className="px-3.5 py-2 bg-white border border-emerald-250 hover:bg-emerald-50/50 text-emerald-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1">
                      📊 Excel
                    </button>
                    <button className="px-3.5 py-2 bg-white border border-blue-250 hover:bg-blue-50/50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1">
                      📁 CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue Report</span>
                    <p className="text-[17px] font-black text-slate-805 mt-1">₹24,58,320</p>
                    <p className="text-[9px] text-[#16A34A] font-bold mt-1">↑ 18.7% vs last month</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-lg shadow-sm">
                    ₹
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booking Report</span>
                    <p className="text-xl font-black text-slate-850 mt-1">1,248</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">↑ 12.4% vs last month</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-lg shadow-sm">
                    📅
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Report</span>
                    <p className="text-xl font-black text-slate-855 mt-1">982</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">↑ 10.6% vs last month</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-lg shadow-sm">
                    👥
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Staff Report</span>
                    <p className="text-xl font-black text-slate-855 mt-1">56</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">↑ 5.3% vs last month</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-lg shadow-sm">
                    👤
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Report</span>
                    <p className="text-xl font-black text-slate-855 mt-1">1,256</p>
                    <p className="text-[9px] text-rose-500 font-bold mt-1">↓ 4.8% vs last month</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-lg shadow-sm">
                    📦
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm">
                <div className="flex flex-wrap items-center gap-3.5 flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📅</span>
                    <select className="pl-8 pr-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                      <option>01 May 2025 - 31 May 2025</option>
                    </select>
                  </div>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Branches</option>
                  </select>

                  <select className="rounded-xl bg-slate-55 border border-slate-200 text-slate-700 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-semibold cursor-pointer">
                    <option>All Services</option>
                  </select>
                </div>
                <button className="px-4 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                  ⚙️ Filters
                </button>
              </div>

              {/* Middle Charts Grid (Line chart, Bar chart, Donut chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview Line Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[340px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-855">Revenue Overview (Line Chart)</h3>
                    </div>
                    <select className="text-[10px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>Daily</option>
                    </select>
                  </div>

                  <div className="relative h-44 w-full flex items-end">
                    <svg className="w-full h-full text-purple-500" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                      <path d="M5 38 L 20 34 L 35 29 L 50 32 L 65 26 L 80 22 L 95 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 38 L 20 34 L 35 29 L 50 32 L 65 26 L 80 22 L 95 16 L 95 50 L 5 50 Z" fill="url(#rev-overview-gradient)" opacity="0.05" />
                      <defs>
                        <linearGradient id="rev-overview-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col justify-between text-[7px] text-slate-400 font-bold items-start py-2">
                      <span>50K</span>
                      <span>40K</span>
                      <span>30K</span>
                      <span>20K</span>
                      <span>10K</span>
                      <span>0</span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 flex justify-between text-[7px] text-slate-400 font-bold px-3 pt-1">
                      <span>01 May</span>
                      <span>06 May</span>
                      <span>11 May</span>
                      <span>16 May</span>
                      <span>21 May</span>
                      <span>26 May</span>
                      <span>31 May</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-black text-slate-800">
                    Total Revenue: <span className="text-purple-600">₹24,58,320</span>
                  </div>
                </div>

                {/* Bookings Overview Bar Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[340px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-855">Bookings Overview (Bar Chart)</h3>
                    </div>
                    <select className="text-[10px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>Weekly</option>
                    </select>
                  </div>

                  <div className="relative h-44 w-full flex items-end justify-between px-2 pt-4">
                    {[
                      { date: '01 May', val: 180, label: '180' },
                      { date: '06 May', val: 210, label: '210' },
                      { date: '11 May', val: 260, label: '260' },
                      { date: '16 May', val: 240, label: '240' },
                      { date: '21 May', val: 310, label: '310' },
                      { date: '26 May', val: 370, label: '370' },
                      { date: '31 May', val: 430, label: '430' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-[7px] text-slate-405 font-bold">{bar.label}</span>
                        <div className="w-4 bg-slate-100 rounded-t h-28 overflow-hidden relative flex items-end">
                          <div className="bg-blue-600 w-full rounded-t transition-all" style={{ height: `${(bar.val / 500) * 100}%` }}></div>
                        </div>
                        <span className="text-[7px] text-slate-400 font-bold mt-1">{bar.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-black text-slate-800">
                    Total Bookings: <span className="text-blue-650">1,248</span>
                  </div>
                </div>

                {/* Customer Distribution Donut Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[340px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-855">Customer Distribution</h3>
                    </div>
                    <select className="text-[10px] text-slate-400 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-xl font-bold cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* New Customers (40%) - Purple */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="4.5" strokeDasharray="40 60" strokeDashoffset="0" />
                        {/* Returning Customers (35%) - Blue */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray="35 65" strokeDashoffset="-40" />
                        {/* Inactive Customers (15%) - Orange */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F97316" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="-75" />
                        {/* Lost Customers (10%) - Red */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="-90" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-sm font-black text-slate-800">982</p>
                        <p className="text-[6.5px] text-slate-400 uppercase font-black tracking-wider">Total</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[8px] text-slate-505 font-bold pr-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>New</span>
                        <span>40% (393)</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Returning</span>
                        <span>35% (344)</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Inactive</span>
                        <span>15% (147)</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Lost</span>
                        <span>10% (98)</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-black text-slate-800">
                    Total Customers: <span className="text-purple-600">982</span>
                  </div>
                </div>
              </div>

              {/* Reports List Table */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 tracking-wide">Reports List</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Report Name</th>
                        <th className="py-4.5 px-4">Description</th>
                        <th className="py-4.5 px-4">Generated On</th>
                        <th className="py-4.5 px-4">Period</th>
                        <th className="py-4.5 px-4">Format</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { name: 'Revenue Report', desc: 'Detailed revenue and earnings report', gen: '31 May 2025, 10:30 AM', pd: '01 May 2025 - 31 May 2025' },
                        { name: 'Booking Report', desc: 'Booking summary and trends', gen: '31 May 2025, 10:28 AM', pd: '01 May 2025 - 31 May 2025' },
                        { name: 'Customer Report', desc: 'Customer growth and activity report', gen: '31 May 2025, 10:25 AM', pd: '01 May 2025 - 31 May 2025' },
                        { name: 'Staff Report', desc: 'Staff performance and attendance report', gen: '31 May 2025, 10:22 AM', pd: '01 May 2025 - 31 May 2025' },
                        { name: 'Inventory Report', desc: 'Inventory status and usage report', gen: '31 May 2025, 10:20 AM', pd: '01 May 2025 - 31 May 2025' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                            <span>📊</span> {item.name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.desc}</td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.gen}</td>
                          <td className="py-4 px-4 font-semibold text-slate-500">{item.pd}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1.5">
                              <button className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-black transition-all">PDF</button>
                              <button className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-[9px] font-black transition-all">Excel</button>
                              <button className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[9px] font-black transition-all">CSV</button>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[9px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1 mx-auto">
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-slate-50/30">
                  <span>Showing 1 to 5 of 5 reports</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business_profile" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              
              {/* Business Profile Sub-Navigation Tab Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-2">
                <div className="flex gap-6 text-xs font-bold text-slate-400">
                  <button 
                    onClick={() => setProfileSubTab("dashboard")} 
                    className={`pb-2 px-1 transition-all ${profileSubTab === "dashboard" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    👤 Profile Dashboard
                  </button>
                  <button 
                    onClick={() => setProfileSubTab("details")} 
                    className={`pb-2 px-1 transition-all ${profileSubTab === "details" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    🏢 Business Details
                  </button>
                  <button 
                    onClick={() => setProfileSubTab("working_hours")} 
                    className={`pb-2 px-1 transition-all ${profileSubTab === "working_hours" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    ⏱️ Working Hours
                  </button>
                  <button 
                    onClick={() => setProfileSubTab("gallery")} 
                    className={`pb-2 px-1 transition-all ${profileSubTab === "gallery" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    🖼️ Gallery Management
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* VIEW 1: PROFILE DASHBOARD */}
              {/* ========================================================================= */}
              {profileSubTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Breadcrumbs & Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>Business Profile</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">Franchise Profile</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Franchise Profile Dashboard</h2>
                      <p className="text-xs text-slate-555 mt-1">Overview of your franchise business information and status.</p>
                    </div>
                    <button 
                      onClick={() => setProfileSubTab("details")} 
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>

                  {/* 4 Vertical Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Franchise Info Card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[360px]">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Franchise Information</span>
                        <span className="text-slate-400">ℹ️</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3 my-2 text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1617886903355-9354be5f65c2?auto=format&fit=crop&q=80&w=200" alt="Roy Motors workshop" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">Roy Motors</h4>
                          <p className="text-[9px] text-blue-600 font-bold uppercase">GMF12345</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[9.5px] text-slate-505 font-semibold">
                        <div className="flex items-start gap-1.5">
                          <span>📍</span>
                          <span>123, Green Park Avenue, Sector 45, Noida, UP - 201301</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📞</span>
                          <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>✉️</span>
                          <span>roymotors@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          <span>Joined on: 15 Feb 2024</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setProfileSubTab("details")} 
                        className="w-full text-center text-blue-600 hover:text-blue-500 font-bold text-[10px] pt-2 border-t border-slate-50"
                      >
                        View Full Details →
                      </button>
                    </div>

                    {/* Membership Status Card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[360px]">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Membership Status</span>
                        <span className="text-slate-400">👑</span>
                      </div>

                      <div className="flex flex-col items-center gap-2 my-2 text-center">
                        <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-lg shadow-sm">
                          🛡️
                    </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">Premium Member</h4>
                          <p className="text-[8.5px] text-emerald-600 font-bold">Valid Till: 15 Feb 2026</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 text-[9.5px] text-slate-505 font-semibold">
                        <div className="flex justify-between items-center">
                          <span>Plan Name</span>
                          <span className="text-slate-800 font-bold">Premium Annual</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Member Since</span>
                          <span className="text-slate-800 font-bold">15 Feb 2024</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Auto Renewal</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-650">Enabled</span>
                        </div>
                      </div>

                      <button className="w-full text-center text-blue-600 hover:text-blue-500 font-bold text-[10px] pt-2 border-t border-slate-50">
                        Manage Subscription ⚙️
                      </button>
                    </div>

                    {/* Franchise Rating Card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[360px]">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Franchise Rating</span>
                        <span className="text-slate-400">⭐</span>
                      </div>

                      <div className="flex items-center gap-4 my-1 justify-center">
                        <p className="text-2xl font-black text-slate-800">4.6</p>
                        <div>
                          <span className="text-amber-500 text-xs">★★★★★</span>
                          <p className="text-[8px] text-slate-400 font-bold">(128 Reviews)</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[8.5px] text-slate-505 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-9">5 Stars</span>
                          <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-500 h-full w-[70%]"></div>
                          </div>
                          <span className="w-6 text-right">70%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-9">4 Stars</span>
                          <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-500 h-full w-[20%]"></div>
                          </div>
                          <span className="w-6 text-right">20%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-9">3 Stars</span>
                          <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-500 h-full w-[7%]"></div>
                          </div>
                          <span className="w-6 text-right">7%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-9">2 Stars</span>
                          <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-500 h-full w-[2%]"></div>
                          </div>
                          <span className="w-6 text-right">2%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-9">1 Star</span>
                          <div className="flex-1 bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-500 h-full w-[1%]"></div>
                          </div>
                          <span className="w-6 text-right">1%</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab("ratings")}
                        className="w-full text-center text-blue-600 hover:text-blue-500 font-bold text-[10px] pt-2 border-t border-slate-50"
                      >
                        View All Reviews →
                      </button>
                    </div>

                    {/* KYC Status Card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[360px]">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">KYC Status</span>
                        <span className="text-slate-400">🛡️</span>
                      </div>

                      <div className="flex flex-col items-center gap-2 my-2 text-center">
                        <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-lg shadow-sm">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">Verified</h4>
                          <p className="text-[8.5px] text-slate-400 font-bold">All documents verified</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[9.5px] text-slate-505 font-semibold">
                        <div className="flex justify-between items-center">
                          <span>PAN Card</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Verified</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>GST Certificate</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Verified</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Address Proof</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Verified</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Bank Details</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Verified</span>
                        </div>
                      </div>

                      <button className="w-full text-center text-blue-600 hover:text-blue-500 font-bold text-[10px] pt-2 border-t border-slate-50">
                        View KYC Details →
                      </button>
                    </div>
                  </div>

                  {/* Middle Section (Franchise Overview & Recent Activity) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Franchise Overview Card */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-850 pb-2 border-b border-slate-100 mb-4">Franchise Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                          <div className="sm:col-span-7 space-y-3.5 text-xs text-slate-505 font-semibold">
                            <div className="flex justify-between">
                              <span>Franchise Name</span>
                              <span className="text-slate-800 font-bold">Roy Motors</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Franchise ID</span>
                              <span className="text-slate-800 font-bold">GMF12345</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Business Type</span>
                              <span className="text-slate-800 font-bold">Car Washing & Detailing</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Established On</span>
                              <span className="text-slate-800 font-bold">10 Jan 2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Number of Staff</span>
                              <span className="text-slate-800 font-bold">18</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Service Locations</span>
                              <span className="text-slate-800 font-bold">1</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Bookings</span>
                              <span className="text-slate-800 font-bold">1,248</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Revenue</span>
                              <span className="text-slate-800 font-bold">₹24,58,320</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preferred Payment Mode</span>
                              <span className="text-slate-800 font-bold">Online</span>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-5 flex flex-col justify-between items-center gap-3">
                            <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <img src="https://images.unsplash.com/photo-1617886903355-9354be5f65c2?auto=format&fit=crop&q=80&w=300" alt="workshop front" className="w-full h-full object-cover" />
                            </div>
                            <button 
                              onClick={() => setProfileSubTab("details")}
                              className="w-full py-2 bg-slate-55 border border-slate-200 rounded-xl text-[10px] font-black text-blue-600 hover:bg-slate-100 flex items-center justify-center gap-1"
                            >
                              ✏️ Update Information
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                          <h3 className="text-sm font-black text-slate-855">Recent Activity</h3>
                          <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All Activity</button>
                        </div>

                        <div className="space-y-4">
                          {[
                            { title: 'New booking received', desc: 'Booking ID #BK-7256 for 26 May 2025', time: '10:30 AM', icon: '📅', iconBg: 'bg-blue-50 text-blue-600' },
                            { title: 'Payment received', desc: 'Payment of ₹2,450 received for booking #BK-7240', time: '09:45 AM', icon: '💵', iconBg: 'bg-emerald-50 text-emerald-600' },
                            { title: 'New review received', desc: 'You received a 5 star review from Rahul Sharma', time: 'Yesterday', icon: '⭐', iconBg: 'bg-amber-50 text-amber-600' },
                            { title: 'KYC documents verified', desc: 'Your KYC documents have been verified successfully', time: '24 May 2025', icon: '🛡️', iconBg: 'bg-purple-50 text-purple-650' },
                            { title: 'New offer activated', desc: 'Flat 20% OFF on Premium Wash services', time: '23 May 2025', icon: '📢', iconBg: 'bg-orange-50 text-orange-600' }
                          ].map((act, idx) => (
                            <div key={idx} className="flex items-start gap-3.5 text-xs">
                              <div className={`w-8 h-8 rounded-full ${act.iconBg} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
                                {act.icon}
                              </div>
                              <div className="flex-1">
                                <span className="font-bold text-slate-855 block leading-tight">{act.title}</span>
                                <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">{act.desc}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{act.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics overview row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bookings</span>
                        <p className="text-xl font-black text-slate-805 mt-1">1,248</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">This Month</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-base shadow-sm">
                        📅
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue</span>
                        <p className="text-xl font-black text-slate-850 mt-1">₹24,58,320</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">This Month</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-base shadow-sm">
                        ₹
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Customers</span>
                        <p className="text-xl font-black text-slate-855 mt-1">982</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">This Month</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-base shadow-sm">
                        👥
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repeat Customers</span>
                        <p className="text-xl font-black text-slate-855 mt-1">65%</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">This Month</p>
                      </div>
                      <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-base shadow-sm">
                        🔄
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 2: BUSINESS DETAILS */}
              {/* ========================================================================= */}
              {profileSubTab === "details" && (
                <div className="space-y-6">
                  {/* Breadcrumbs & Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>Business Profile</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">Business Details</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Business Details</h2>
                      <p className="text-xs text-slate-555 mt-1">Update your business information. Keep your details up to date.</p>
                    </div>
                    <button 
                      onClick={() => setProfileSubTab("dashboard")} 
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      💾 Save Changes
                    </button>
                  </div>

                  {/* Profile Completion Header Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-xs font-black text-slate-800">
                        <span>Profile Completion</span>
                        <span className="text-blue-600">72% Completed</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[72%] rounded-full"></div>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold">4 of 6 sections completed</p>
                    </div>
                    
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-sm">
                      📋
                    </div>
                  </div>

                  {/* Main Business Details Form */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="text-blue-650 text-base">🏢</span>
                      <h3 className="text-sm font-black text-slate-855">Business Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5">Business Name *</label>
                        <input type="text" defaultValue="Roy Motors" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                        <span className="text-[9px] text-slate-400 block mt-1">Enter your registered business name.</span>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5">Business Type</label>
                        <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer">
                          <option>Car Washing & Detailing</option>
                          <option>Full Detailing & PPF</option>
                          <option>Mechanical Repairs</option>
                        </select>
                        <span className="text-[9px] text-slate-400 block mt-1">Select your business type.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-6">
                        <label className="block text-slate-450 font-bold mb-1.5">Address *</label>
                        <textarea defaultValue="123, Green Park Avenue, Sector 45, Noida, Uttar Pradesh - 201301" rows={3} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                        <span className="text-[9px] text-slate-400 block mt-1">Enter your complete business address.</span>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-slate-450 font-bold mb-1.5">City *</label>
                        <input type="text" defaultValue="Noida" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-slate-450 font-bold mb-1.5">Pincode *</label>
                        <input type="text" defaultValue="201301" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5">State *</label>
                        <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer">
                          <option>Uttar Pradesh</option>
                          <option>Delhi</option>
                          <option>Haryana</option>
                          <option>Karnataka</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5">Country *</label>
                        <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer">
                          <option>India</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* GST, Working Hours Shortcuts, Contact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* GST Details */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-80 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-purple-600 text-base">📄</span>
                        <h4 className="font-black text-slate-850">GST Details</h4>
                      </div>

                      <div className="space-y-4 my-2">
                        <div>
                          <label className="block text-slate-450 font-bold mb-1">GST Number</label>
                          <input type="text" defaultValue="09ABCDE1234F1Z5" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-850 font-bold focus:outline-none" />
                          <span className="text-[8.5px] text-slate-400 block mt-1">Enter your GST number.</span>
                        </div>

                        <div>
                          <label className="block text-slate-450 font-bold mb-1">GST Certificate</label>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-500">📄</span>
                              <div>
                                <span className="font-bold text-slate-800 block text-[9.5px]">GST_Certificate.pdf</span>
                                <span className="text-[8px] text-slate-400 font-bold">245 KB</span>
                              </div>
                            </div>
                            <button className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[9.5px] font-black transition-all">Upload New</button>
                          </div>
                          <span className="text-[8.5px] text-slate-400 block mt-1">Upload GST certificate (PDF, JPG, PNG)</span>
                        </div>
                      </div>
                    </div>

                    {/* Working Hours Shortcut */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-80 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-emerald-650 text-base">⏱️</span>
                        <h4 className="font-black text-slate-855">Working Hours</h4>
                      </div>

                      <div className="space-y-3.5 my-2">
                        <div>
                          <label className="block text-slate-450 font-bold mb-1">Opening Time</label>
                          <input type="text" defaultValue="09:00 AM" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-850 font-bold focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-450 font-bold mb-1">Closing Time</label>
                          <input type="text" defaultValue="08:00 PM" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-855 font-bold focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-450 font-bold mb-1">Working Days</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <span key={day} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black">{day}</span>
                            ))}
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[8px] font-black">Sun</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-80 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-amber-600 text-base">📞</span>
                        <h4 className="font-black text-slate-850">Contact Information</h4>
                      </div>

                      <div className="space-y-3.5 my-2">
                        <div>
                          <label className="block text-slate-455 font-bold mb-1">Mobile Number *</label>
                          <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-850 font-bold focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-455 font-bold mb-1">Email Address *</label>
                          <input type="text" defaultValue="roymotors@gmail.com" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-855 font-bold focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-455 font-bold mb-1">Alternate Number</label>
                          <input type="text" defaultValue="+91 98765 43211 (Optional)" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2 text-slate-855 font-bold focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 3: WORKING HOURS */}
              {/* ========================================================================= */}
              {profileSubTab === "working_hours" && (
                <div className="space-y-6">
                  {/* Breadcrumbs & Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>Business Profile</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">Working Hours</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Working Hours</h2>
                      <p className="text-xs text-slate-555 mt-1">Set your business working hours and manage holidays.</p>
                    </div>
                    <button 
                      onClick={() => setProfileSubTab("dashboard")} 
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      💾 Save Changes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Weekly Schedule (Left Column) */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-blue-650 text-base">📅</span>
                        <h3 className="text-sm font-black text-slate-850">Weekly Schedule</h3>
                      </div>
                      
                      <div className="space-y-3.5">
                        {[
                          { day: 'Monday', active: true, open: '09:00 AM', close: '08:00 PM', desc: '24 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Tuesday', active: true, open: '09:00 AM', close: '08:00 PM', desc: '24 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Wednesday', active: true, open: '09:00 AM', close: '08:00 PM', desc: '24 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Thursday', active: true, open: '09:00 AM', close: '08:00 PM', desc: '24 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Friday', active: true, open: '09:00 AM', close: '08:30 PM', desc: '23.5 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Saturday', active: true, open: '09:00 AM', close: '09:00 PM', desc: '24 Hrs Open', descColor: 'text-emerald-600' },
                          { day: 'Sunday', active: false, open: '--:--', close: '--:--', desc: 'Closed', descColor: 'text-rose-500' }
                        ].map((sched, idx) => (
                          <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <span className="w-20 font-bold text-slate-800">{sched.day}</span>
                            <div className="flex items-center gap-1.5">
                              <input type="checkbox" defaultChecked={sched.active} className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer" />
                              <span className="text-[10px] text-slate-500 font-bold">{sched.active ? 'Open' : 'Closed'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="text" defaultValue={sched.open} className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-[10px]" disabled={!sched.active} />
                              <span>to</span>
                              <input type="text" defaultValue={sched.close} className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-[10px]" disabled={!sched.active} />
                            </div>
                            <span className={`text-[10px] font-black ${sched.descColor}`}>{sched.desc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 bg-blue-50/30 rounded-2xl border border-blue-100 text-blue-650 text-[10.5px] font-bold">
                        ℹ️ Closing time will be considered as the last booking time for the day.
                      </div>
                    </div>

                    {/* Right Column (Holidays & Summary) */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Holiday Management Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <h3 className="text-sm font-black text-slate-855">Holiday Management</h3>
                          <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 rounded-xl text-[10px] font-black transition-all">+ Add Holiday</button>
                        </div>

                        <div className="space-y-3">
                          {[
                            { name: 'Independence Day', dt: '15 Aug 2025 (Friday)', badge: 'Upcoming' },
                            { name: 'Gandhi Jayanti', dt: '02 Oct 2025 (Thursday)', badge: 'Upcoming' },
                            { name: 'Diwali', dt: '12 Nov 2025 (Wednesday)', badge: 'Upcoming' },
                            { name: 'Christmas Day', dt: '25 Dec 2025 (Thursday)', badge: 'Upcoming' },
                            { name: 'New Year\'s Day', dt: '01 Jan 2026 (Thursday)', badge: 'Upcoming' }
                          ].map((hol, idx) => (
                            <div key={idx} className="p-3 bg-slate-50/50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 flex justify-between items-center transition-colors">
                              <div>
                                <p className="font-bold text-slate-805">{hol.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{hol.dt}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase">{hol.badge}</span>
                                <button className="p-1 hover:bg-slate-100 rounded text-slate-400">✏️</button>
                                <button className="p-1 hover:bg-slate-100 rounded text-red-500">🗑️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="w-full text-center text-blue-650 hover:text-blue-500 font-bold text-[10px] pt-1">
                          View All Holidays →
                        </button>
                      </div>

                      {/* Working Hours Summary Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <span className="text-emerald-650 text-base">⏱️</span>
                          <h4 className="font-black text-slate-850">Working Hours Summary</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3.5 bg-emerald-50/30 rounded-2xl border border-emerald-100 space-y-1">
                            <span className="text-lg">📅</span>
                            <p className="text-[10px] text-slate-400 font-bold">Total Working Days</p>
                            <p className="text-sm font-black text-slate-800">6 Days</p>
                            <p className="text-[7.5px] text-slate-400">Per Week</p>
                          </div>
                          
                          <div className="p-3.5 bg-blue-50/30 rounded-2xl border border-blue-100 space-y-1">
                            <span className="text-lg">⏱️</span>
                            <p className="text-[10px] text-slate-400 font-bold">Average Daily Hours</p>
                            <p className="text-sm font-black text-slate-800">11.5 Hrs</p>
                            <p className="text-[7.5px] text-slate-400">Per Day</p>
                          </div>

                          <div className="p-3.5 bg-purple-50/30 rounded-2xl border border-purple-100 space-y-1">
                            <span className="text-lg">🔄</span>
                            <p className="text-[10px] text-slate-400 font-bold">Weekly Hours</p>
                            <p className="text-sm font-black text-slate-800">69 Hrs</p>
                            <p className="text-[7.5px] text-slate-400">Per Week</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* bottom banner tip */}
                  <div className="p-4 bg-amber-50/30 rounded-3xl border border-amber-150 text-amber-800 text-[11px] font-bold flex items-center gap-2 shadow-sm">
                    <span>💡</span> Keep your working hours updated to avoid booking conflicts and improve customer experience.
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 4: GALLERY MANAGEMENT */}
              {/* ========================================================================= */}
              {profileSubTab === "gallery" && (
                <div className="space-y-6">
                  {/* Breadcrumbs & Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>Business Profile</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">Gallery Management</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-wide">Gallery Management</h2>
                      <p className="text-xs text-slate-555 mt-1">Manage and showcase your business visuals.</p>
                    </div>
                    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                      ➕ Add New Images
                    </button>
                  </div>

                  {/* 3 Upload Options Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-44">
                      <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-650 text-lg shadow-sm">
                        🖼️
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850">Shop Images</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Upload images of your shop, interior, and exterior.</p>
                      </div>
                      <button className="px-5 py-1.5 bg-white border border-emerald-250 hover:bg-emerald-50 text-emerald-650 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                        Upload Shop Images
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-44">
                      <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center text-purple-650 text-lg shadow-sm">
                        👥
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-855">Team Images</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Upload images of your team and staff.</p>
                      </div>
                      <button className="px-5 py-1.5 bg-white border border-purple-255 hover:bg-purple-50 text-purple-650 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                        Upload Team Images
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-44">
                      <div className="w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-lg shadow-sm">
                        🚗
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850">Work Photos</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Upload images of your work and services.</p>
                      </div>
                      <button className="px-5 py-1.5 bg-white border border-amber-255 hover:bg-amber-50 text-amber-655 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                        Upload Work Photos
                      </button>
                    </div>
                  </div>

                  {/* Filter tab row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-1">
                    <div className="flex gap-6 text-xs font-bold text-slate-400">
                      <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1">All Images (42)</button>
                      <button className="hover:text-slate-600 pb-2 px-1">Shop Images (18)</button>
                      <button className="hover:text-slate-600 pb-2 px-1">Team Images (12)</button>
                      <button className="hover:text-slate-600 pb-2 px-1">Work Photos (12)</button>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3.5 py-2 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer shadow-sm">⚙️ Filter</button>
                      <select className="px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer shadow-sm focus:outline-none">
                        <option>Sort By: Newest</option>
                      </select>
                    </div>
                  </div>

                  {/* Gallery Grid (12 Items) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                    {[
                      { title: 'Exterior View', tag: 'Shop', tagBadge: 'bg-emerald-50 text-emerald-600', dt: '26 May 2025', img: 'https://images.unsplash.com/photo-1617886903355-9354be5f65c2?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Workshop Area', tag: 'Shop', tagBadge: 'bg-emerald-50 text-emerald-600', dt: '25 May 2025', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Customer Lounge', tag: 'Shop', tagBadge: 'bg-emerald-50 text-emerald-600', dt: '24 May 2025', img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Service Bay', tag: 'Shop', tagBadge: 'bg-emerald-50 text-emerald-600', dt: '24 May 2025', img: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=200' },
                      
                      { title: 'Our Team', tag: 'Team', tagBadge: 'bg-purple-50 text-purple-650', dt: '26 May 2025', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Technician Team', tag: 'Team', tagBadge: 'bg-purple-50 text-purple-650', dt: '23 May 2025', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Front Desk Team', tag: 'Team', tagBadge: 'bg-purple-50 text-purple-650', dt: '21 May 2025', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Team Meeting', tag: 'Team', tagBadge: 'bg-purple-50 text-purple-650', dt: '21 May 2025', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=200' },

                      { title: 'Car Wash', tag: 'Work', tagBadge: 'bg-amber-50 text-amber-600', dt: '20 May 2025', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Polishing Work', tag: 'Work', tagBadge: 'bg-amber-50 text-amber-600', dt: '19 May 2025', img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Engine Check', tag: 'Work', tagBadge: 'bg-amber-50 text-amber-600', dt: '19 May 2025', img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200' },
                      { title: 'Interior Cleaning', tag: 'Work', tagBadge: 'bg-amber-50 text-amber-600', dt: '18 May 2025', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200' }
                    ].map((photo, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between h-[230px]">
                        <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                          <img src={photo.img} alt={photo.title} className="w-full h-full object-cover" />
                          <span className={`absolute left-2.5 top-2.5 px-2 py-0.5 rounded text-[8px] font-black uppercase ${photo.tagBadge}`}>{photo.tag}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <span className="font-bold text-slate-800 block text-[10.5px] truncate leading-tight">{photo.title}</span>
                          <span className="text-[8.5px] text-slate-400 font-bold block">{photo.dt}</span>
                        </div>
                        <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-50">
                          <button className="p-1 hover:bg-slate-50 rounded text-slate-450">👁️</button>
                          <button className="p-1 hover:bg-slate-50 rounded text-slate-455">✏️</button>
                          <button className="p-1 hover:bg-slate-50 rounded text-red-500">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-white rounded-3xl shadow-sm">
                    <span>Showing 1 to 12 of 42 images</span>
                    <div className="flex items-center gap-1.5">
                      <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">4</button>
                      <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
          {activeTab === "notifications" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Notifications</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Notifications Center</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Notifications Center</h2>
                  <p className="text-xs text-slate-555 mt-1">Stay updated with all important alerts and updates.</p>
                </div>
                <button className="px-4 py-2.5 bg-white border border-blue-200 hover:bg-blue-50/50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  ✓ Mark all as read
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bookings</span>
                      <span className="text-slate-400 text-xs">›</span>
                    </div>
                    <p className="text-2xl font-black text-slate-805 mt-1">28</p>
                    <p className="text-[9px] text-slate-450 font-semibold mt-1">New booking and updates</p>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-650 text-xl shadow-sm ml-3">
                    📅
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payments</span>
                      <span className="text-slate-400 text-xs">›</span>
                    </div>
                    <p className="text-2xl font-black text-slate-850 mt-1">16</p>
                    <p className="text-[9px] text-slate-450 font-semibold mt-1">Payment received and alerts</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-650 text-xl shadow-sm ml-3">
                    💵
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promotions</span>
                      <span className="text-slate-400 text-xs">›</span>
                    </div>
                    <p className="text-2xl font-black text-slate-855 mt-1">12</p>
                    <p className="text-[9px] text-slate-455 font-semibold mt-1">Offers and promotional updates</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl shadow-sm ml-3">
                    📢
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Alerts</span>
                      <span className="text-slate-400 text-xs">›</span>
                    </div>
                    <p className="text-2xl font-black text-slate-855 mt-1">9</p>
                    <p className="text-[9px] text-slate-455 font-semibold mt-1">System and security alerts</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-650 text-xl shadow-sm ml-3">
                    🔔
                  </div>
                </div>
              </div>

              {/* Tabs Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-1">
                <div className="flex gap-6 text-xs font-bold text-slate-400">
                  <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1">All (65)</button>
                  <button className="hover:text-slate-600 pb-2 px-1">Unread (18)</button>
                  <button className="hover:text-slate-600 pb-2 px-1">Important (7)</button>
                </div>
                <div className="flex gap-2">
                  <button className="px-3.5 py-2 bg-slate-55 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Filter
                  </button>
                  <button className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-705 border border-slate-205 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    ⚙️ Settings
                  </button>
                </div>
              </div>

              {/* Notifications Table list */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4.5 px-6">Notification</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4">Time</th>
                        <th className="py-4.5 px-4">Priority</th>
                        <th className="py-4.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {[
                        { unread: true, title: 'New Booking Received', desc: 'A new booking #BK-7245 has been received for 26 May 2025 at 11:00 AM.', cat: 'Bookings', catBadge: 'bg-purple-50 text-purple-650', time: '10 mins ago', prio: 'Important', prioBadge: 'text-rose-600 bg-rose-50/50', icon: '📅', iconBg: 'bg-purple-50 text-purple-650' },
                        { unread: true, title: 'Payment Received', desc: 'Payment of ₹2,450 for booking #BK-7240 has been received successfully.', cat: 'Payments', catBadge: 'bg-emerald-50 text-emerald-650', time: '25 mins ago', prio: 'Important', prioBadge: 'text-rose-600 bg-rose-50/50', icon: '💵', iconBg: 'bg-emerald-50 text-emerald-650' },
                        { unread: false, title: 'Special Offer Live Now!', desc: 'Flat 20% OFF on Premium Wash services. Offer valid till 31 May 2025.', cat: 'Promotions', catBadge: 'bg-amber-50 text-amber-600', time: '1 hour ago', prio: 'Normal', prioBadge: 'text-slate-500 bg-slate-100', icon: '📢', iconBg: 'bg-amber-50 text-amber-600' },
                        { unread: true, title: 'System Maintenance Scheduled', desc: 'System maintenance scheduled on 28 May 2025 from 02:00 AM to 04:00 AM.', cat: 'System Alerts', catBadge: 'bg-blue-50 text-blue-650', time: '2 hours ago', prio: 'Important', prioBadge: 'text-rose-600 bg-rose-50/50', icon: '🔔', iconBg: 'bg-blue-50 text-blue-600' },
                        { unread: false, title: 'Booking Cancelled', desc: 'Booking #BK-7238 has been cancelled by the customer.', cat: 'Bookings', catBadge: 'bg-purple-50 text-purple-650', time: '3 hours ago', prio: 'Normal', prioBadge: 'text-slate-500 bg-slate-100', icon: '📅', iconBg: 'bg-purple-50 text-purple-650' },
                        { unread: false, title: 'Refund Processed', desc: 'Refund of ₹1,250 for booking #BK-7232 has been processed.', cat: 'Payments', catBadge: 'bg-emerald-50 text-emerald-650', time: '4 hours ago', prio: 'Normal', prioBadge: 'text-slate-500 bg-slate-100', icon: '💵', iconBg: 'bg-emerald-50 text-emerald-650' },
                        { unread: false, title: 'Weekend Mega Sale', desc: 'Get up to 30% OFF on all services this weekend. Don\'t miss out!', cat: 'Promotions', catBadge: 'bg-amber-50 text-amber-600', time: '1 day ago', prio: 'Normal', prioBadge: 'text-slate-500 bg-slate-100', icon: '📢', iconBg: 'bg-amber-50 text-amber-600' },
                        { unread: false, title: 'Password Changed Successfully', desc: 'Your account password was changed successfully.', cat: 'System Alerts', catBadge: 'bg-blue-50 text-blue-650', time: '1 day ago', prio: 'Important', prioBadge: 'text-rose-600 bg-rose-50/50', icon: '🔔', iconBg: 'bg-blue-50 text-blue-600' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4.5 px-6">
                            <div className="flex items-start gap-3">
                              {/* Unread Indicator */}
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-4 flex-shrink-0" style={{ opacity: item.unread ? 1 : 0 }}></div>
                              
                              {/* Icon */}
                              <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}>
                                {item.icon}
                              </div>
                              
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{item.title}</span>
                                <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">{item.desc}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.catBadge}`}>{item.cat}</span>
                          </td>
                          <td className="py-4.5 px-4 font-semibold text-slate-500 whitespace-nowrap">{item.time}</td>
                          <td className="py-4.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-flex items-center gap-1 ${item.prioBadge}`}>
                              <span>⏱️</span> {item.prio}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">👁️</button>
                              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">⋮</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-slate-100 text-xs font-semibold text-slate-505 bg-slate-50/30">
                  <span>Showing 1 to 8 of 65 notifications</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 font-bold cursor-pointer bg-white text-slate-800 text-[11px]">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">‹</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all cursor-pointer">1</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">2</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">3</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">4</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">...</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">7</button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-all cursor-pointer">›</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Guide Banner */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="text-blue-600 flex items-center gap-1.5">
                  ℹ️ Enable email or push notifications from Settings to never miss an important update.
                </div>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-650 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Support</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Support Center</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Support Center</h2>
                  <p className="text-xs text-slate-555 mt-1">We're here to help! Choose a support option or find answers to your questions.</p>
                </div>
              </div>

              {/* 4 contact options cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-48">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-650 text-xl shadow-sm">
                    ❓
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-850">FAQ</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Find answers to common questions and issues.</p>
                  </div>
                  <button className="px-5 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-purple-650 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                    View FAQs →
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-48">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-650 text-xl shadow-sm">
                    🎫
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-855">Raise Ticket</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Facing an issue? Raise a ticket and our team will assist you.</p>
                  </div>
                  <button className="px-5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-655 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                    Raise Ticket →
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-48">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-650 text-xl shadow-sm">
                    💬
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-850">Live Chat</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Chat live with our support team for immediate help.</p>
                  </div>
                  <div className="space-y-1">
                    <button className="px-5 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-655 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                      Start Live Chat →
                    </button>
                    <p className="text-[8px] text-emerald-600 font-bold flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-48">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-xl shadow-sm">
                    📞
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-850">Call Support</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Speak with our support executives over the phone.</p>
                  </div>
                  <div className="space-y-1 w-full">
                    <button className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black transition-all shadow-sm flex items-center justify-center gap-1">
                      📞 Call Now
                    </button>
                    <p className="text-[9px] text-slate-800 font-bold mt-1">+91 98765 43210</p>
                    <p className="text-[7.5px] text-slate-400 font-bold">Mon - Sat | 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Middle Section (Frequently Asked Questions Left, My Support Tickets & Support Hours Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FAQs Card */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-850">Frequently Asked Questions</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All FAQs →</button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        'How can I book a service?',
                        'How do I make a payment?',
                        'Can I reschedule or cancel a booking?',
                        'How do I track my service status?',
                        'How do I apply a coupon or offer?',
                        'What payment methods are accepted?',
                        'How can I update my profile or password?'
                      ].map((faq, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                          <span className="font-bold text-slate-800 text-[11px]">{faq}</span>
                          <span className="text-slate-400 text-xs">∨</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column Cards */}
                <div className="lg:col-span-5 space-y-6">
                  {/* My Support Tickets Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-855">My Support Tickets</h3>
                        <button className="text-xs text-blue-600 hover:text-blue-500 font-bold">View All →</button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: '#TKT-2025-0578', title: 'Payment not refunded', date: 'Raised on: 25 May 2025, 10:30 AM', status: 'Open', statusBadge: 'bg-emerald-50 text-emerald-600' },
                          { id: '#TKT-2025-0561', title: 'Unable to book a service', date: 'Raised on: 24 May 2025, 04:15 PM', status: 'In Progress', statusBadge: 'bg-orange-50 text-orange-600' },
                          { id: '#TKT-2025-0542', title: 'App login issue', date: 'Raised on: 22 May 2025, 11:20 AM', status: 'Closed', statusBadge: 'bg-slate-100 text-slate-500' }
                        ].map((tkt, idx) => (
                          <div key={idx} className="p-3 bg-slate-50/30 hover:bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center cursor-pointer transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{tkt.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${tkt.statusBadge}`}>{tkt.status}</span>
                              </div>
                              <p className="text-[10px] text-slate-800 font-bold mt-1">{tkt.title}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{tkt.date}</p>
                            </div>
                            <span className="text-slate-400 text-xs">›</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Support Hours Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">⏱️</span>
                        <h4 className="text-xs font-black text-slate-850">Support Hours</h4>
                      </div>
                      <div className="space-y-2 text-[9px] text-slate-500 font-bold">
                        <div>
                          <p className="text-slate-800">Monday - Saturday</p>
                          <p className="text-slate-400 mt-0.5">9:00 AM - 7:00 PM</p>
                        </div>
                        <div>
                          <p className="text-slate-800">Sunday</p>
                          <p className="text-slate-400 mt-0.5">10:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Headphones Illustration Icon */}
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-4xl shadow-sm">
                      🎧
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Footer Banner */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-650 text-base shadow-sm">🛡️</span>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Still need help?</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Our support team is available to assist you with any queries.</span>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1">
                  Contact Support Team →
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Breadcrumbs & Header */}
              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>Profile & Account</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600">
                    {profileSection === "personal" && "Personal Details"}
                    {profileSection === "bank" && "Bank Details"}
                    {profileSection === "documents" && "Documents"}
                    {profileSection === "password" && "Password"}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wide">Profile & Account</h2>
                <p className="text-xs text-slate-555 mt-1">Manage your personal information, documents and account settings.</p>
              </div>

              {/* Sub tabs list row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-1 mb-2">
                <div className="flex gap-6 text-xs font-bold text-slate-400">
                  <button 
                    onClick={() => setProfileSection("personal")}
                    className={`pb-2 px-1 transition-all flex items-center gap-1.5 ${profileSection === "personal" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    👤 Personal Details
                  </button>
                  <button 
                    onClick={() => setProfileSection("bank")}
                    className={`pb-2 px-1 transition-all flex items-center gap-1.5 ${profileSection === "bank" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    🏦 Bank Details
                  </button>
                  <button 
                    onClick={() => setProfileSection("documents")}
                    className={`pb-2 px-1 transition-all flex items-center gap-1.5 ${profileSection === "documents" ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    📁 Documents
                  </button>
                  <button 
                    onClick={() => setProfileSection("password" as any)}
                    className={`pb-2 px-1 transition-all flex items-center gap-1.5 ${profileSection === ("password" as any) ? "text-blue-650 border-b-2 border-blue-655" : "hover:text-slate-600"}`}
                  >
                    🔑 Password
                  </button>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("franchise_token");
                    window.location.reload();
                  }}
                  className="pb-2 px-1 text-red-500 hover:text-red-650 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  🚪 Logout
                </button>
              </div>

              {/* ========================================================== */}
              {/* SECTION 1: PERSONAL DETAILS */}
              {/* ========================================================== */}
              {profileSection === "personal" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-semibold text-slate-700">
                  {/* Left Form Column */}
                  <form onSubmit={handleSavePersonalDetails} className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                    {/* Profile Picture card */}
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Picture</h3>
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-900 shadow-sm flex items-center justify-center flex-shrink-0">
                          {/* Dark blue background avatar matching mockup */}
                          <img src={uploadedLogo || "https://images.unsplash.com/photo-1617886903355-9354be5f65c2?auto=format&fit=crop&q=80&w=200"} alt="Roy Motors" className="w-full h-full object-cover opacity-90" />
                          <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] border border-white shadow-sm cursor-pointer">
                            📷
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold">JPG, PNG or WEBP. Max size of 2MB.</p>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="px-3.5 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm text-center block">
                              Upload New Photo
                            </button>
                            <input type="file" ref={logoInputRef} onChange={handlePhotoUploadSubmit} className="hidden" accept="image/*" />
                            <button type="button" onClick={handlePhotoRemoveSubmit} className="px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1">
                              🗑️ Remove Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-455 font-bold mb-1.5">Full Name *</label>
                          <input type="text" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-455 font-bold mb-1.5">Email Address *</label>
                          <input type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-slate-455 font-bold mb-1.5">Mobile Number *</label>
                          <input type="text" value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-slate-455 font-bold mb-1.5">Date of Birth</label>
                          <div className="relative">
                            <input type="text" value={personalDob} onChange={(e) => setPersonalDob(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">📅</span>
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-slate-455 font-bold mb-1.5">Gender</label>
                          <select value={personalGender} onChange={(e) => setPersonalGender(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-805 font-bold focus:outline-none cursor-pointer">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-455 font-bold mb-1.5">Nationality</label>
                          <select value={personalGender} onChange={(e) => setPersonalGender(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none cursor-pointer">
                            <option value="Indian">Indian</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <label className="block text-slate-455 font-bold mb-1.5">Address *</label>
                          <textarea value={personalAddress} onChange={(e) => setPersonalAddress(e.target.value)} required rows={3} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-455 font-bold mb-1.5">City</label>
                          <input type="text" value={personalCity} onChange={(e) => setPersonalCity(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-455 font-bold mb-1.5">State</label>
                          <input type="text" value={personalState} onChange={(e) => setPersonalState(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-455 font-bold mb-1.5">Pincode</label>
                          <input type="text" value={personalPincode} onChange={(e) => setPersonalPincode(e.target.value)} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => fetchDashboardData()} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-sm transition-all cursor-pointer">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl font-black shadow-sm transition-all cursor-pointer">
                        💾 Save Changes
                      </button>
                    </div>
                  </form>

                  {/* Right Column details */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Account Overview */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                      <h3 className="text-sm font-black text-slate-855 pb-2 border-b border-slate-100">Account Overview</h3>
                      <div className="space-y-3.5 pt-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">🛡️ Account Type</span>
                          <span className="text-slate-800 font-bold">Franchise</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">👤 Franchise Name</span>
                          <span className="text-slate-800 font-bold">{profile?.franchiseName || "Roy Motors"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">🆔 Franchise ID</span>
                          <span className="text-blue-600 font-bold">{profile?.franchiseId || "GMF12345"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">⏱️ Member Since</span>
                          <span className="text-slate-800 font-bold">12 Jan 2024</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">⚙️ Account Status</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${profile?.isActive ? "bg-emerald-50 text-emerald-650" : "bg-rose-50 text-rose-650"}`}>
                            {profile?.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                      <h3 className="text-sm font-black text-slate-855 pb-2 border-b border-slate-100">Quick Actions</h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setProfileSection("bank")}
                          className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">🏦</span>
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">Bank Details</span>
                              <span className="text-[8.5px] text-slate-400 font-semibold block mt-0.5">Manage your bank account information</span>
                            </div>
                          </div>
                          <span className="text-blue-600">→</span>
                        </button>

                        <button 
                          onClick={() => setProfileSection("documents")}
                          className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">📁</span>
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">Documents</span>
                              <span className="text-[8.5px] text-slate-400 font-semibold block mt-0.5">Upload and manage your documents</span>
                            </div>
                          </div>
                          <span className="text-blue-600">→</span>
                        </button>

                        <button 
                          onClick={() => setProfileSection("password" as any)}
                          className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">🔑</span>
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">Change Password</span>
                              <span className="text-[8.5px] text-slate-400 font-semibold block mt-0.5">Update your account password</span>
                            </div>
                          </div>
                          <span className="text-blue-600">→</span>
                        </button>

                        <button 
                          onClick={() => {
                            localStorage.removeItem("franchise_token");
                            window.location.reload();
                          }}
                          className="w-full flex items-center justify-between p-3 bg-rose-50/30 hover:bg-rose-50/50 border border-rose-100 rounded-2xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-red-500">🚪</span>
                            <div>
                              <span className="font-bold text-red-650 block leading-tight">Logout</span>
                              <span className="text-[8.5px] text-red-400 font-semibold block mt-0.5">Sign out from your account</span>
                            </div>
                          </div>
                          <span className="text-red-500">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SECTION 2: BANK DETAILS */}
              {/* ========================================================== */}
              {profileSection === "bank" && (
                <form onSubmit={handleSaveBankDetails} className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5 text-xs font-semibold text-slate-700 max-w-3xl">
                  <h3 className="text-sm font-black text-slate-855 pb-2 border-b border-slate-100">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">Bank Name</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">Account Holder Name</label>
                      <input type="text" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">Account Number</label>
                      <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">IFSC Code</label>
                      <input type="text" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} required className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                    </div>
                  </div>

                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl font-black shadow-sm transition-all cursor-pointer">Save Bank Details</button>
                </form>
              )}

              {/* ========================================================== */}
              {/* SECTION 3: DOCUMENTS */}
              {/* ========================================================== */}
              {profileSection === "documents" && (
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700 max-w-3xl">
                  <h3 className="text-sm font-black text-slate-855 pb-2 border-b border-slate-100">Uploaded Documents</h3>
                  
                  <div className="space-y-3.5">
                    {[
                      { type: 'PAN Card', label: 'PAN Card' },
                      { type: 'GST Certificate', label: 'GST Certificate' },
                      { type: 'Address Proof', label: 'Address Proof (Electricity Bill)' },
                      { type: 'Cancelled Cheque', label: 'Bank Details (Cancelled Cheque)' }
                    ].map((docType, idx) => {
                      const existingDoc = documentsList.find(d => d.type === docType.type);
                      return (
                        <div key={idx} className="p-3 bg-slate-50/50 hover:bg-slate-100/30 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="text-red-500 text-lg">📄</span>
                            <div>
                              <span className="font-bold text-slate-800 block text-[11px]">{docType.label}</span>
                              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                {existingDoc ? `${existingDoc.file} (${existingDoc.status.toUpperCase()})` : "Not Uploaded"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {existingDoc && (
                              <button type="button" onClick={() => alert("Viewing " + existingDoc.file)} className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[10px] font-black shadow-sm transition-all cursor-pointer">View</button>
                            )}
                            <label className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[10px] font-black shadow-sm cursor-pointer text-center block transition-all">
                              {existingDoc ? "Re-upload" : "Upload"}
                              <input type="file" onChange={(e) => handleDocumentUploadSubmit(docType.type, e)} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SECTION 4: PASSWORD */}
              {/* ========================================================== */}
              {profileSection === ("password" as any) && (
                <form onSubmit={handleChangePasswordSubmit} className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700 max-w-3xl">
                  <h3 className="text-sm font-black text-slate-855 pb-2 border-b border-slate-100">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">Current Password</label>
                      <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">New Password</label>
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-455 font-bold mb-1.5">Confirm New Password</label>
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl font-black shadow-sm transition-all cursor-pointer">Change Password</button>
                </form>
              )}\n              {/* bottom secure banner */}
              <div className="p-4 bg-blue-50/20 rounded-3xl border border-blue-150 text-blue-700 text-xs font-semibold flex items-center gap-3 shadow-sm">
                <span className="text-lg">🛡️</span>
                <span>Your account information is secure and encrypted. We never share your personal information with anyone.</span>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-8 rounded-3xl shadow-sm border border-slate-100 pb-10">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Settings</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">Settings Center</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-wide">Settings</h2>
                  <p className="text-xs text-slate-555 mt-1">Manage your system preferences and configurations.</p>
                </div>
              </div>

              {/* Split layout: Left sidebar for Settings Sub-Tabs, Right content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                {/* Left settings navigation */}
                <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-1 h-fit">
                  {[
                    { key: 'general', name: 'General Settings', desc: 'Basic system and business settings', icon: '⚙️' },
                    { key: 'notifications', name: 'Notification Settings', desc: 'Manage notification preferences', icon: '🔔' },
                    { key: 'language', name: 'Language', desc: 'Select your preferred language', icon: '🌐' },
                    { key: 'security', name: 'Security', desc: 'Manage security and access', icon: '🛡️' },
                    { key: 'theme', name: 'Theme', desc: 'Customize system appearance', icon: '🎨' },
                    { key: 'payment', name: 'Payment Settings', desc: 'Configure payment preferences', icon: '💳' },
                    { key: 'printer', name: 'Printer Settings', desc: 'Configure printer and receipt settings', icon: '🖨️' }
                  ].map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => setSettingsSubTab(sub.key as any)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                        settingsSubTab === sub.key 
                          ? 'bg-blue-50/50 border border-blue-100 text-blue-650' 
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{sub.icon}</span>
                        <div>
                          <span className="font-bold block leading-tight">{sub.name}</span>
                          <span className="text-[8.5px] text-slate-400 font-semibold block mt-0.5">{sub.desc}</span>
                        </div>
                      </div>
                      <span className="text-slate-400">›</span>
                    </button>
                  ))}
                </div>

                {/* Right content view area */}
                <div className="lg:col-span-9 space-y-6">
                  {/* ========================================================== */}
                  {/* VIEW 1: GENERAL SETTINGS */}
                  {/* ========================================================== */}
                  {settingsSubTab === "general" && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <span className="text-blue-650 text-base">⚙️</span>
                          <div>
                            <h3 className="text-sm font-black text-slate-850">General Settings</h3>
                            <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Update your business and system general settings.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Business Name</label>
                            <input type="text" defaultValue="Roy Motors" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Business Currency</label>
                            <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none cursor-pointer">
                              <option>INR - Indian Rupee (₹)</option>
                              <option>USD - US Dollar ($)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Business Email</label>
                            <input type="text" defaultValue="roymotors@gmail.com" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">System Time</label>
                            <div className="relative">
                              <input type="text" defaultValue="10:30 AM" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">⏱️</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Business Phone</label>
                            <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">System Date</label>
                            <div className="relative">
                              <input type="text" defaultValue="26 May 2025" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">📅</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Business Address</label>
                            <textarea defaultValue="123, Green Park Avenue, Sector 45, Noida, Uttar Pradesh - 201301" rows={3} className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none" />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-slate-455 font-bold mb-1.5">Week Start Day</label>
                              <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none cursor-pointer">
                                <option>Monday</option>
                                <option>Sunday</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-455 font-bold mb-1.5">Items Per Page</label>
                              <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none cursor-pointer">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-slate-455 font-bold mb-1.5">Time Zone</label>
                            <select className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none cursor-pointer">
                              <option>(GMT+05:30) Asia/Kolkata</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                          <div>
                            <label className="block text-slate-455 font-bold mb-2">Date Format</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="dtFormat" defaultChecked className="text-blue-650" />
                                <span>DD MMM YYYY</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="dtFormat" className="text-blue-650" />
                                <span>MMM DD YYYY</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="dtFormat" className="text-blue-650" />
                                <span>YYYY-MM-DD</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-455 font-bold mb-2">Number Format</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="numFormat" defaultChecked className="text-blue-650" />
                                <span>1,234.56</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="numFormat" className="text-blue-650" />
                                <span>1.234,56</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="numFormat" className="text-blue-650" />
                                <span>1 234,56</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-3">
                          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl font-black shadow-sm flex items-center gap-1.5">
                            💾 Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* VIEW 2: SECURITY SETTINGS */}
                  {/* ========================================================== */}
                  {settingsSubTab === "security" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left forms */}
                      <div className="lg:col-span-8 space-y-6">
                        {/* Change Password Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-655 text-base">🔑</span>
                              <h3 className="text-sm font-black text-slate-850">Change Password</h3>
                            </div>
                            <button className="text-blue-600 hover:text-blue-500 font-bold text-[10px]">⚙️ Change Password</button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-slate-455 font-bold mb-1">Current Password</label>
                              <input type="password" placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-slate-455 font-bold mb-1">New Password</label>
                              <input type="password" placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-slate-455 font-bold mb-1">Confirm New Password</label>
                              <input type="password" placeholder="••••••••" className="w-full bg-slate-55 border border-slate-200 rounded-xl p-2.5 focus:outline-none" />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[8.5px] text-slate-400 font-bold pt-1.5">
                            <span className="text-emerald-600">✓ Use at least 8 characters</span>
                            <span className="text-emerald-600">✓ Include uppercase & lowercase letters</span>
                            <span className="text-emerald-600">✓ Include number & special character</span>
                          </div>
                        </div>

                        {/* Biometric Login */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="text-blue-655 text-base">🖐️</span>
                            <h3 className="text-sm font-black text-slate-850">Biometric Login</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-800">Fingerprint Login</p>
                                <p className="text-[8.5px] text-slate-400 mt-0.5">Login quickly using fingerprint sensor.</p>
                              </div>
                              <input type="checkbox" defaultChecked className="w-8 h-4 bg-blue-600 rounded-full cursor-pointer" />
                            </div>

                            <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-800">Face ID Login</p>
                                <p className="text-[8.5px] text-slate-400 mt-0.5">Login using face recognition.</p>
                              </div>
                              <input type="checkbox" defaultChecked className="w-8 h-4 bg-blue-600 rounded-full cursor-pointer" />
                            </div>
                          </div>
                        </div>

                        {/* 2FA Authentication */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-655 text-base">🛡️</span>
                              <h3 className="text-sm font-black text-slate-850">2FA Authentication</h3>
                            </div>
                            <input type="checkbox" defaultChecked className="w-8 h-4 bg-blue-600 rounded-full cursor-pointer" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                            <div className="p-3.5 bg-slate-50/30 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-[8.5px] text-slate-400 font-bold block">Authentication Method</span>
                                <span className="font-bold text-slate-850 text-xs block mt-1">Authenticator App (TOTP)</span>
                              </div>
                            </div>
                            <div className="p-3.5 bg-slate-50/30 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-[8.5px] text-slate-400 font-bold block">Backup Codes</span>
                                <span className="font-bold text-slate-850 text-xs block mt-1">10 backup codes available</span>
                              </div>
                              <button className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-black shadow-sm">View Codes</button>
                            </div>
                          </div>
                          
                          <button className="text-[9.5px] text-blue-600 hover:text-blue-500 font-bold">Learn more about 2FA →</button>
                        </div>

                        {/* Session Management Table */}
                        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden text-slate-700">
                          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 tracking-wide">Session Management</h3>
                            <button className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black transition-all">Log Out All Other Sessions</button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                  <th className="py-4 px-6">Device</th>
                                  <th className="py-4 px-4">Location</th>
                                  <th className="py-4 px-4">IP Address</th>
                                  <th className="py-4 px-4">Last Active</th>
                                  <th className="py-4 px-4">Status</th>
                                  <th className="py-4 px-4 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 px-6 font-bold text-slate-800 flex items-center gap-2">
                                    💻 Windows • Chrome <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-50 text-blue-650">Current Device</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500">Noida, India</td>
                                  <td className="py-3.5 px-4 text-slate-500">103.21.45.78</td>
                                  <td className="py-3.5 px-4 text-slate-500">Just now</td>
                                  <td className="py-3.5 px-4">
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-650">Active</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center">—</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 px-6 font-bold text-slate-800">
                                    📱 Android • Mobile App
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500">Ghaziabad, India</td>
                                  <td className="py-3.5 px-4 text-slate-500">103.21.45.91</td>
                                  <td className="py-3.5 px-4 text-slate-500">2 hours ago</td>
                                  <td className="py-3.5 px-4">
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-650">Active</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <button className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9.5px] font-black transition-all">Log Out</button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <button className="w-full text-center text-blue-650 hover:text-blue-500 font-bold text-[10px] py-3.5 border-t border-slate-100">
                            View All Sessions (3) ∨
                          </button>
                        </div>
                      </div>

                      {/* Right Overview panel */}
                      <div className="lg:col-span-4 space-y-6">
                        {/* Security Overview Card */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between items-center text-center h-[280px]">
                          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl shadow-sm">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Your account is secure</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">All security features are active.</p>
                          </div>
                          
                          <div className="w-full space-y-2 text-[9.5px] text-slate-505 font-bold text-left pt-2 border-t border-slate-50">
                            <div className="flex justify-between">
                              <span>Password</span>
                              <span className="text-emerald-600">Strong</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Biometric Login</span>
                              <span className="text-emerald-600">Enabled</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2FA Authentication</span>
                              <span className="text-emerald-600">Enabled</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Active Sessions</span>
                              <span className="text-slate-700">2 Active</span>
                            </div>
                          </div>
                        </div>

                        {/* Security Tip Box */}
                        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-150 shadow-sm flex items-start gap-3 text-xs font-semibold text-slate-700 h-[160px]">
                          <span className="text-xl">🔒</span>
                          <div className="space-y-1">
                            <h4 className="font-black text-blue-900 text-xs">Security Tip</h4>
                            <p className="text-[9.5px] text-blue-800/80 leading-relaxed font-bold">Enable all security features to keep your account protected from unauthorized access.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* OTHER MOCK SETTINGS SUB-TABS */}
                  {/* ========================================================== */}
                  {['notifications', 'language', 'theme', 'payment', 'printer'].includes(settingsSubTab) && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm text-center py-20 text-slate-400 font-bold space-y-2">
                      <span className="text-3xl block">⚙️</span>
                      <p>Settings tab {settingsSubTab} panel configuration matches theme systems.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Support Banner */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-3xl border border-slate-150 bg-white shadow-sm text-xs font-semibold text-slate-505">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-650 text-base shadow-sm">ℹ️</span>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Need Help?</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Contact our support team for any assistance with settings.</span>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-650 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1">
                  Contact Support →
                </button>
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
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
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
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
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

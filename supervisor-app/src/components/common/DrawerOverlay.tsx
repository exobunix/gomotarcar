import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Image, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { setDrawerOpen } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { navigate } from '../../utils/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

const menuItems = [
  { name: 'DashboardTab', label: 'Dashboard', icon: 'home-outline' },
  { name: 'ApartmentsTab', label: 'Apartments', icon: 'office-building' },
  { name: 'CleanersTab', label: 'Cleaners', icon: 'account-multiple-outline' },
  { name: 'TodayCleaningTab', label: "Today's Cleaning", icon: 'steering' },
  { name: 'AttendanceTab', label: 'Attendance', icon: 'calendar-check-outline' },
  { name: 'ApprovalsTab', label: 'Approvals', icon: 'clipboard-check-outline' },
  { name: 'InventoryTab', label: 'Inventory', icon: 'cube-outline' },
  { name: 'ComplaintsTab', label: 'Complaints', icon: 'message-text-outline' },
  { name: 'NotificationsTab', label: 'Notifications', icon: 'bell-outline' },
  { name: 'ReportsTab', label: 'Reports', icon: 'chart-box-outline' },
  { name: 'EarningsTab', label: 'Earnings', icon: 'wallet-outline' },
  { name: 'LeavesTab', label: 'Leaves', icon: 'calendar-multiselect' },
];

const DrawerOverlay: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { drawerOpen } = useSelector((s: RootState) => s.ui);
  const { supervisor } = useSelector((s: RootState) => s.auth);
  
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) {
      // Open drawer
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close drawer
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen]);

  const close = () => {
    dispatch(setDrawerOpen(false));
  };

  const handleNavigate = (tabName: string) => {
    close();
    navigate(tabName);
  };

  const handleLogout = () => {
    close();
    dispatch(logout());
  };

  if (!drawerOpen) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.Text
        style={[styles.backdrop, { opacity: fadeAnim }]}
        onPress={close}
      />

      {/* Drawer Body */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 44 : 20),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          },
        ]}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatar} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Supervisor'}</Text>
            <Text style={styles.profileRole}>Operations Supervisor</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Menu Items */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => handleNavigate(item.name)}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={item.icon} size={22} color="#475569" style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* Logout Section */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#EF4444" style={styles.menuIcon} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#EFF6FF',
  },
  profileDetails: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  profileRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  menuContainer: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    fontFamily: 'Inter-Medium',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: 'Inter-SemiBold',
  },
});

export default DrawerOverlay;

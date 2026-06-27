import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { logout } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { supervisor } = useSelector((s: RootState) => s.auth);

  const menuItems = [
    { icon: '📱', label: 'QR Management', screen: 'QRList' },
    { icon: '📦', label: 'Inventory', screen: 'InventoryList' },
    { icon: '⚠️', label: 'Grievances', screen: 'GrievanceList' },
    { icon: '📊', label: 'Salary & Incentives', screen: 'SalaryIncentives' },
    { icon: '📋', label: 'Task History', screen: 'DailyWorkMonitoring' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '👤', label: 'Profile Management', screen: 'ProfileManagement' },
    { icon: '⚙️', label: 'Settings', screen: 'Settings' },
    { icon: '🎧', label: 'Support Center', screen: 'SupportCenter' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(supervisor?.firstName || 'S')[0]}</Text></View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.name}>{supervisor?.firstName} {supervisor?.lastName}</Text>
              <Text style={styles.role}>Supervisor</Text>
              <Text style={styles.zone}>Zone: {supervisor?.assignedZone?.name || 'All'}</Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={{ marginTop: 16 }}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{supervisor?.phone}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{supervisor?.email || 'N/A'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Cleaners</Text><Text style={styles.infoValue}>{supervisor?.cleanerCount || 0}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Experience</Text><Text style={styles.infoValue}>{supervisor?.experience || 0} years</Text></View>
        </Card>

        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}

        <Button title="Sign Out" variant="danger" onPress={() => dispatch(logout())} size="lg" style={{ marginTop: 20 }} />

        <Text style={styles.version}>GoMotarCar Supervisor v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  name: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  role: { fontSize: 13, color: colors.primaryBlue, fontFamily: 'Inter-Medium', marginTop: 2 },
  zone: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 8 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  menuArrow: { fontSize: 16, color: colors.textLight, fontFamily: 'Inter-Regular' },
  version: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 24, fontFamily: 'Inter-Regular' },
});

export default ProfileScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const dispatch = useDispatch();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RM</Text>
        </View>
        <Text style={styles.name}>Roy Motors</Text>
        <Text style={styles.franchiseName}>Franchise ID: GMF12345</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Personal Details</Text>
        <ProfileRow label="Owner Name" value="Roy Motors" />
        <ProfileRow label="Email" value="roymotors@gmail.com" />
        <ProfileRow label="Mobile" value="+91 98765 43210" />
        <ProfileRow label="Address" value="Noida, Uttar Pradesh" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏦 Bank Details</Text>
        <ProfileRow label="Bank Name" value="HDFC Bank" />
        <ProfileRow label="Account Holder" value="Roy Motors Pvt Ltd" />
        <ProfileRow label="Account Number" value="50200012345678" />
        <ProfileRow label="IFSC Code" value="HDFC0000123" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Documents</Text>
        <ProfileRow label="PAN Card" value="Uploaded (PAN_RoyMotors.pdf)" />
        <ProfileRow label="GST Certificate" value="Uploaded (GST_Certificate.pdf)" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout() as any)}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', padding: 30, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#0D5BD7' },
  name: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  franchiseName: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '600' },
  section: { backgroundColor: '#fff', margin: 16, marginVertical: 8, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  label: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  value: { fontSize: 12, color: '#0F172A', fontWeight: '800', flex: 1, textAlign: 'right' },
  logoutButton: { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '800' },
});

export default ProfileScreen;

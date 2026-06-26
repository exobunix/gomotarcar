import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
);

const ProfileScreen = () => {
  const dispatch = useDispatch();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>O</Text></View>
        <Text style={styles.name}>Operations Team</Text>
        <Text style={styles.role}>GoMotarCar Operations</Text>
      </View>
      <View style={styles.section}>
        <ProfileRow label="Name" value="Team Member" />
        <ProfileRow label="Email" value="ops@gomotarcar.com" />
        <ProfileRow label="Role" value="Operations" />
        <ProfileRow label="Team" value="GoMotarCar Operations" />
      </View>
      <TouchableOpacity style={styles.logout} onPress={() => dispatch({ type: 'auth/logout' })}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: 30, paddingTop: 60, backgroundColor: colors.primaryBlue },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: colors.primaryBlue },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontFamily: 'Inter-Regular' },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, fontFamily: 'Inter-SemiBold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280', fontFamily: 'Inter-Regular' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', fontFamily: 'Inter-Medium' },
  logout: { margin: 16, backgroundColor: '#EF4444', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
});

export default ProfileScreen;

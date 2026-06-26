import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

const MOCK_STAFF = [
  { id: '1', name: 'Rajesh Kumar', role: 'Mechanic', phone: '+91-9876543210', status: 'active' },
  { id: '2', name: 'Suresh Patel', role: 'Electrician', phone: '+91-9876543211', status: 'active' },
  { id: '3', name: 'Amit Singh', role: 'Detailer', phone: '+91-9876543212', status: 'inactive' },
];

const StaffScreen = () => {
  const [staff] = useState(MOCK_STAFF);

  const renderStaff = ({ item }: { item: typeof MOCK_STAFF[0] }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#22C55E20' : '#EF444420' }]}>
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#22C55E' : '#EF4444' }]}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity style={styles.addButton}><Text style={styles.addButtonText}>+ Add</Text></TouchableOpacity>
      </View>
      <FlatList data={staff} keyExtractor={(item) => item.id} renderItem={renderStaff} contentContainerStyle={styles.list} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  addButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: colors.primaryBlue, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0D5BD720', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: colors.primaryBlue },
  cardInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Inter-SemiBold' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2, fontFamily: 'Inter-Regular' },
  phone: { fontSize: 13, color: '#6B7280', marginTop: 2, fontFamily: 'Inter-Regular' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
});

export default StaffScreen;

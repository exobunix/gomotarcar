import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MOCK_STAFF = [
  { id: '1', name: 'Rajesh Kumar', role: 'Mechanic', phone: '+91-9876543210', status: 'active' },
  { id: '2', name: 'Suresh Patel', role: 'Electrician', phone: '+91-9876543211', status: 'active' },
  { id: '3', name: 'Amit Singh', role: 'Detailer', phone: '+91-9876543212', status: 'inactive' },
];

const StaffScreen = () => {
  const [staff] = useState(MOCK_STAFF);

  const renderStaff = ({ item }: { item: typeof MOCK_STAFF[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#DCFCE7' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#16A34A' : '#EF4444' }]}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <Text style={styles.headerSub}>Manage your franchise team members</Text>
        </View>
        <TouchableOpacity style={styles.addButton}><Text style={styles.addButtonText}>+ Add</Text></TouchableOpacity>
      </View>
      <FlatList data={staff} keyExtractor={(item) => item.id} renderItem={renderStaff} contentContainerStyle={styles.list} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  addButton: { backgroundColor: '#E0F2FE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  addButtonText: { color: '#0D5BD7', fontWeight: '800', fontSize: 12 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#0D5BD7' },
  cardInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  role: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  phone: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});

export default StaffScreen;

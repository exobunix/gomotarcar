import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';

const TABS = ['Cleaners', 'Supervisors', 'Franchises'];

const ApprovalsScreen = () => {
  const [activeTab, setActiveTab] = useState('Cleaners');
  const { pendingCleaners, pendingSupervisors, pendingFranchises } = useSelector((state: any) => state.approvals);

  const data = activeTab === 'Cleaners' ? pendingCleaners : activeTab === 'Supervisors' ? pendingSupervisors : pendingFranchises;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name || item.firstName} {item.lastName || ''}</Text>
        <Text style={styles.phone}>{item.phone || 'N/A'}</Text>
        <Text style={styles.date}>Applied: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveBtn}><Text style={styles.btnText}>✓</Text></TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn}><Text style={styles.btnText}>✗</Text></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Approvals</Text></View>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={data} keyExtractor={(_, idx) => String(idx)} renderItem={renderItem} contentContainerStyle={styles.list} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  activeTab: { backgroundColor: colors.primaryBlue },
  tabText: { color: '#666', fontFamily: 'Inter-Medium' },
  activeTabText: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', elevation: 2 },
  cardContent: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Inter-SemiBold' },
  phone: { fontSize: 14, color: '#6B7280', marginTop: 4, fontFamily: 'Inter-Regular' },
  date: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'Inter-Regular' },
  actions: { justifyContent: 'center', gap: 8 },
  approveBtn: { backgroundColor: '#22C55E20', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#EF444420', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 18, fontWeight: 'bold' },
});

export default ApprovalsScreen;

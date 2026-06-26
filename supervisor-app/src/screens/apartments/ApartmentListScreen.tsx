import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchApartments } from '../../redux/slices/apartmentSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const ApartmentListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { apartments, loading } = useSelector((s: RootState) => s.apartments);
  const [search, setSearch] = useState('');

  const load = useCallback(() => { dispatch(fetchApartments()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = apartments.filter((a) =>
    !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()) || a.city?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ApartmentDetail', { apartmentId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <StatusBadge status={item.qrAssigned ? 'active' : 'pending_activation'} />
        </View>
        <Text style={styles.itemAddress}>{item.address}, {item.city}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemCustomer}>{item.customerId?.name || 'No customer'}</Text>
          <Text style={styles.itemPincode}>{item.pincode}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Apartments" onBack={() => navigation.goBack()} rightAction={
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddApartment')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      } />
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search apartments..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={<EmptyState icon="🏢" title="No Apartments" description="Add your first apartment" />}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 20, marginBottom: 0, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: colors.border },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular', padding: 0 },
  listContent: { padding: 20, paddingBottom: 40 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 22, color: colors.white, fontWeight: '300' },
  itemCard: { marginBottom: 8 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  itemAddress: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  itemCustomer: { fontSize: 12, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
  itemPincode: { fontSize: 12, color: colors.textLight, fontFamily: 'Inter-Regular' },
});

export default ApartmentListScreen;

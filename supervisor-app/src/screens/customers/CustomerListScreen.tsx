import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { customerService } from '../../services/customer.service';

interface Props { navigation: any }

const CustomerListScreen: React.FC<Props> = ({ navigation }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await customerService.list(); setCustomers(res.data.data); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = customers.filter((c) =>
    !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CustomerDetail', { customerId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.itemTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || '?')[0]}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPhone}>{item.phone}</Text>
          </View>
          <Text style={styles.itemCount}>{item.apartments || 0} apts</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Customers" onBack={() => navigation.goBack()} rightAction={
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NewOnboarding')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      } />
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search customers..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>
      <FlatList data={filtered} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<EmptyState icon="👥" title="No Customers" description="Onboard your first customer" />}
        renderItem={renderItem} />
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
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  itemPhone: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  itemCount: { fontSize: 12, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
});

export default CustomerListScreen;

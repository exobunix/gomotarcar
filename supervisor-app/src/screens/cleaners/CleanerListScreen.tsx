import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchCleaners } from '../../redux/slices/cleanerSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const CleanerListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleaners, loading } = useSelector((s: RootState) => s.cleaners);
  const [search, setSearch] = useState('');

  const load = useCallback(() => { dispatch(fetchCleaners()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = cleaners.filter((c) =>
    !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CleanerDetail', { cleanerId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.itemTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || '?')[0]}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <StatusBadge status={item.isActive ? 'active' : 'inactive'} size="sm" />
            </View>
            <Text style={styles.itemPhone}>{item.phone}</Text>
            <Text style={styles.itemStats}>Rating: {item.rating?.toFixed(1) || 'N/A'} • {item.completedTasks || 0} tasks</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Cleaners" onBack={() => navigation.goBack()} />
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search cleaners..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>
      <FlatList data={filtered} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={<EmptyState icon="🧹" title="No Cleaners" description="Add your first cleaner" />}
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
  itemCard: { marginBottom: 8 },
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  itemPhone: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  itemStats: { fontSize: 11, color: colors.textLight, marginTop: 2, fontFamily: 'Inter-Regular' },
});

export default CleanerListScreen;

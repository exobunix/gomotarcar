import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchInventory } from '../../redux/slices/inventorySlice';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

const CATEGORY_META: Record<string, { bg: string; color: string; icon: string }> = {
  cleaning: { bg: '#FFF7ED', color: '#C2410C', icon: 'spray-bottle' },
  chemicals: { bg: '#EFF6FF', color: '#2563EB', icon: 'flask-outline' },
  equipment: { bg: '#FAF5FF', color: '#8B5CF6', icon: 'wrench-outline' },
  safety: { bg: '#ECFDF5', color: '#16A34A', icon: 'shield-check-outline' },
  uniform: { bg: '#FEF2F2', color: '#EF4444', icon: 'tshirt-crew-outline' },
  cloth: { bg: '#FFF7ED', color: '#D97706', icon: 'hanger' },
  shampoo: { bg: '#EFF6FF', color: '#2563EB', icon: 'bottle-tonic-outline' },
  spray: { bg: '#FAF5FF', color: '#8B5CF6', icon: 'spray' },
};

const getStockStatus = (item: any) => {
  const qty = item.available ?? item.quantity ?? 0;
  const min = item.minStock ?? 20;
  if (qty <= 0) return { label: 'Out of Stock', bg: '#FEF2F2', color: '#EF4444' };
  if (qty <= min) return { label: 'Low Stock', bg: '#FFF7ED', color: '#D97706' };
  return { label: 'In Stock', bg: '#ECFDF5', color: '#16A34A' };
};

const InventoryListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { items, loading } = useSelector((s: RootState) => s.inventory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const load = useCallback(() => { dispatch(fetchInventory()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];

  const filtered = items.filter(item => {
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchSearch = !search.trim() ||
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalItems = items.length;
  const lowStock = items.filter(i => {
    const qty = i.available ?? i.quantity ?? 0;
    return qty > 0 && qty <= (i.minStock ?? 20);
  }).length;
  const outOfStock = items.filter(i => (i.available ?? i.quantity ?? 0) <= 0).length;

  const renderItem = ({ item }: { item: any }) => {
    const catMeta = CATEGORY_META[item.category?.toLowerCase()] || { bg: '#F1F5F9', color: '#64748B', icon: 'cube-outline' };
    const stockStatus = getStockStatus(item);
    const qty = item.available ?? item.quantity ?? 0;
    const allocated = item.allocated ?? 0;
    const total = item.quantity ?? qty + allocated;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InventoryDetail', { itemId: item._id })}
        activeOpacity={0.88}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: catMeta.bg }]}>
            <Icon name={catMeta.icon} size={20} color={catMeta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={[styles.catTag, { backgroundColor: catMeta.bg }]}>
              <Text style={[styles.catTxt, { color: catMeta.color }]}>{item.category?.toUpperCase() || 'ITEM'}</Text>
            </View>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
            <Text style={[styles.stockBadgeTxt, { color: stockStatus.color }]}>{stockStatus.label}</Text>
          </View>
        </View>

        {/* Stock bars */}
        <View style={styles.stockRow}>
          <View style={styles.stockCell}>
            <Text style={styles.stockLabel}>Total</Text>
            <Text style={styles.stockVal}>{total} {item.unit || 'pcs'}</Text>
          </View>
          <View style={styles.stockCell}>
            <Text style={styles.stockLabel}>Allocated</Text>
            <Text style={[styles.stockVal, { color: '#F97316' }]}>{allocated} {item.unit || 'pcs'}</Text>
          </View>
          <View style={styles.stockCell}>
            <Text style={styles.stockLabel}>Available</Text>
            <Text style={[styles.stockVal, { color: stockStatus.color }]}>{qty} {item.unit || 'pcs'}</Text>
          </View>
        </View>

        {/* Progress bar */}
        {total > 0 && (
          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, {
              width: `${Math.min((qty / total) * 100, 100)}%` as any,
              backgroundColor: stockStatus.color,
            }]} />
          </View>
        )}

        {/* Bottom row */}
        <View style={styles.cardFooter}>
          {item.minStock ? (
            <Text style={styles.minStockTxt}>Min Stock: {item.minStock}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('InventoryDetail', { itemId: item._id })}
          >
            <Text style={styles.viewBtnTxt}>View Details →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 52 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Inventory Management</Text>
            <Text style={styles.headerSub}>{totalItems} items tracked</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{loading ? '—' : totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#FCD34D' }]}>{loading ? '—' : lowStock}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#FCA5A5' }]}>{loading ? '—' : outOfStock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        style={styles.catFilters}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.catChip, categoryFilter === cat && styles.catChipActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.catChipTxt, categoryFilter === cat && { color: '#FFF' }]}>{cat}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563EB" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
              <>
                <Icon name="cube-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No inventory items</Text>
                <Text style={styles.emptySub}>Pull down to refresh</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1D4ED8', paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, marginBottom: 10 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#FFF', padding: 0 },
  catFilters: { backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  catChipTxt: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  listContent: { padding: 14, paddingBottom: 32, gap: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  catTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  catTxt: { fontSize: 9, fontWeight: '700' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  stockBadgeTxt: { fontSize: 9, fontWeight: '800' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 8 },
  stockCell: { alignItems: 'center' },
  stockLabel: { fontSize: 9, color: '#94A3B8', marginBottom: 3 },
  stockVal: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  progressOuter: { height: 5, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressInner: { height: '100%' as any, borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  minStockTxt: { fontSize: 10, color: '#94A3B8' },
  viewBtn: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EFF6FF', borderRadius: 8 },
  viewBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94A3B8' },
});

export default InventoryListScreen;

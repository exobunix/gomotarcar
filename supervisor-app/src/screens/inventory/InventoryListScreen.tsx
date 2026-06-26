import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { fetchInventory } from '../../redux/slices/inventorySlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const InventoryListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((s: RootState) => s.inventory);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => { dispatch(fetchInventory()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const categories = ['all', ...new Set(items.map((i) => i.category))];
  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('InventoryDetail', { itemId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={[styles.stockText, { color: item.available <= item.minStock ? '#EF4444' : '#22C55E' }]}>
            {item.available}/{item.quantity}
          </Text>
        </View>
        <View style={styles.itemBottom}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <View style={styles.stockBarBg}>
            <View style={[styles.stockBarFill, { width: `${(item.available / item.quantity) * 100}%`, backgroundColor: item.available <= item.minStock ? '#EF4444' : '#22C55E' }]} />
          </View>
        </View>
        <View style={styles.itemMeta}>
          <Text style={styles.metaLabel}>Allocated: {item.allocated} {item.unit}</Text>
          <Text style={styles.metaLabel}>Min: {item.minStock}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Inventory" onBack={() => navigation.goBack()} />
      <FlatList
        data={filtered} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.chip, filter === cat && styles.chipActive]} onPress={() => setFilter(cat)}>
                <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={<EmptyState icon="📦" title="No Inventory" description="Add inventory items to track supplies" />}
        renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lightBlue, borderColor: colors.primaryBlue },
  chipText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  itemCard: { marginBottom: 8 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', flex: 1 },
  stockText: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },
  itemBottom: { marginBottom: 6 },
  itemCategory: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, textTransform: 'capitalize', fontFamily: 'Inter-Regular' },
  stockBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  stockBarFill: { height: 6, borderRadius: 3 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metaLabel: { fontSize: 11, color: colors.textLight, fontFamily: 'Inter-Regular' },
});

export default InventoryListScreen;

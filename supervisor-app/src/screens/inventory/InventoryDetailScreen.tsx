import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../redux/store';
import { allocateInventory, restockInventory } from '../../redux/slices/inventorySlice';
import cleanerService from '../../services/cleaner.service';

interface Props { navigation: any; route: any }

const InventoryDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { itemId } = route.params;
  const { items, loading } = useSelector((s: RootState) => s.inventory);
  const item = items.find((i) => i._id === itemId);

  // Cleaners list for allocation
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [cleanersLoading, setCleanersLoading] = useState(false);

  // Modals state
  const [allocateVisible, setAllocateVisible] = useState(false);
  const [restockVisible, setRestockVisible] = useState(false);

  // Form states
  const [allocateQty, setAllocateQty] = useState('');
  const [selectedCleaner, setSelectedCleaner] = useState<any>(null);
  const [cleanerSearch, setCleanerSearch] = useState('');
  const [showCleanerSelect, setShowCleanerSelect] = useState(false);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    // Load cleaners on mount
    setCleanersLoading(true);
    cleanerService.list({ limit: 1000 })
      .then(res => setCleaners(res.data?.data || []))
      .catch(err => console.error(err))
      .finally(() => setCleanersLoading(false));
  }, []);

  if (!item) return <View style={styles.container}><Header title="Item" onBack={() => navigation.goBack()} /></View>;

  const qty = item.available ?? item.quantity ?? 0;
  const allocated = item.allocated ?? 0;
  const total = item.quantity ?? qty + allocated;
  const stockPercent = total > 0 ? (qty / total) * 100 : 0;
  const isLowStock = qty <= (item.minStock ?? 20);

  const handleAllocate = () => {
    const qtyVal = Number(allocateQty);
    if (!selectedCleaner) {
      Alert.alert('Error', 'Please select a cleaner.');
      return;
    }
    if (!qtyVal || qtyVal <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }
    if (qtyVal > qty) {
      Alert.alert('Error', `Cannot allocate more than available stock (${qty} ${item.unit}).`);
      return;
    }

    dispatch(allocateInventory({
      cleanerId: selectedCleaner._id,
      itemId: item.itemId || item._id,
      quantity: qtyVal
    })).unwrap()
      .then(() => {
        Alert.alert('✓ Success', `Successfully allocated ${qtyVal} ${item.unit} to ${selectedCleaner.firstName}.`);
        setAllocateVisible(false);
        setAllocateQty('');
        setSelectedCleaner(null);
      })
      .catch(err => {
        Alert.alert('Error', err || 'Failed to allocate inventory.');
      });
  };

  const handleRestock = () => {
    const qtyVal = Number(restockQty);
    if (!qtyVal || qtyVal <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    dispatch(restockInventory({
      itemId: item.itemId || item._id,
      quantity: qtyVal
    })).unwrap()
      .then(() => {
        Alert.alert('✓ Success', `Successfully restocked ${qtyVal} ${item.unit}.`);
        setRestockVisible(false);
        setRestockQty('');
      })
      .catch(err => {
        Alert.alert('Error', err || 'Failed to restock inventory.');
      });
  };

  const filteredCleaners = cleaners.filter(c => {
    const name = `${c.firstName} ${c.lastName || ''}`.toLowerCase();
    return name.includes(cleanerSearch.toLowerCase()) || (c.cleanerId || '').toLowerCase().includes(cleanerSearch.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <Header title={item.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && <ActivityIndicator color="#2563EB" style={{ marginBottom: 12 }} />}
        
        <Card variant="elevated" padding={20}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <View style={styles.stockSection}>
            <View style={[styles.stockBar, { backgroundColor: isLowStock ? '#EF444420' : '#22C55E20' }]}>
              <View style={[styles.stockFill, { width: `${stockPercent}%`, backgroundColor: isLowStock ? '#EF4444' : '#22C55E' }]} />
            </View>
            <Text style={[styles.stockText, { color: isLowStock ? '#EF4444' : '#22C55E' }]}>
              {qty}/{total} {item.unit} available
            </Text>
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={{ marginTop: 16 }}>
          <View style={styles.row}><Text style={styles.label}>Total Quantity</Text><Text style={styles.value}>{total} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Allocated</Text><Text style={styles.value}>{allocated} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Available</Text><Text style={styles.value}>{qty} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Min Stock Level</Text><Text style={[styles.value, isLowStock && { color: '#EF4444' }]}>{item.minStock} {item.unit}</Text></View>
        </Card>

        {isLowStock && (
          <Card variant="outlined" padding={16} style={[styles.alertCard]}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>Low stock alert! Only {qty} {item.unit} remaining.</Text>
          </Card>
        )}

        <Button title="Allocate to Cleaner" size="lg" onPress={() => setAllocateVisible(true)} style={{ marginTop: 16 }} />
        <Button title="Restock" variant="outline" size="lg" onPress={() => setRestockVisible(true)} style={{ marginTop: 10 }} />
      </ScrollView>

      {/* Allocate Modal */}
      <Modal visible={allocateVisible} transparent animationType="slide" onRequestClose={() => setAllocateVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={modalStyles.title}>Allocate Cleaner</Text>
              <TouchableOpacity onPress={() => setAllocateVisible(false)}>
                <Icon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>Select Cleaner</Text>
            <TouchableOpacity style={modalStyles.selectBtn} onPress={() => setShowCleanerSelect(true)}>
              <Text style={[modalStyles.selectBtnTxt, selectedCleaner && { color: '#1E293B' }]}>
                {selectedCleaner ? `${selectedCleaner.firstName} ${selectedCleaner.lastName || ''} (${selectedCleaner.cleanerId || 'No ID'})` : 'Choose cleaner...'}
              </Text>
              <Icon name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>

            <Text style={[modalStyles.label, { marginTop: 12 }]}>Quantity to Issue ({item.unit})</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="e.g. 5"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={allocateQty}
              onChangeText={setAllocateQty}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity style={[modalStyles.btn, modalStyles.cancelBtn]} onPress={() => setAllocateVisible(false)}>
                <Text style={modalStyles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.btn, modalStyles.submitBtn]} onPress={handleAllocate}>
                <Text style={modalStyles.submitTxt}>Allocate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cleaner Search Sub-Modal */}
        <Modal visible={showCleanerSelect} transparent animationType="fade" onRequestClose={() => setShowCleanerSelect(false)}>
          <View style={modalStyles.overlay}>
            <View style={[modalStyles.sheet, { maxHeight: '75%', width: '90%', borderRadius: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={modalStyles.title}>Choose Cleaner</Text>
                <TouchableOpacity onPress={() => setShowCleanerSelect(false)}>
                  <Icon name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={modalStyles.searchBar}>
                <Icon name="magnify" size={20} color="#94A3B8" />
                <TextInput
                  style={modalStyles.searchInput}
                  placeholder="Search cleaner..."
                  placeholderTextColor="#94A3B8"
                  value={cleanerSearch}
                  onChangeText={setCleanerSearch}
                />
              </View>

              <ScrollView style={{ marginTop: 12 }}>
                {cleanersLoading ? (
                  <ActivityIndicator color="#2563EB" style={{ marginVertical: 20 }} />
                ) : filteredCleaners.length === 0 ? (
                  <Text style={{ textAlign: 'center', marginVertical: 20, color: '#64748B' }}>No cleaners found</Text>
                ) : (
                  filteredCleaners.map(c => (
                    <TouchableOpacity
                      key={c._id}
                      style={modalStyles.cleanerRow}
                      onPress={() => {
                        setSelectedCleaner(c);
                        setShowCleanerSelect(false);
                      }}
                    >
                      <Image source={require('../../assets/cleaner_avatar.png')} style={modalStyles.cleanerAvatar} />
                      <View>
                        <Text style={modalStyles.cleanerName}>{c.firstName} {c.lastName || ''}</Text>
                        <Text style={modalStyles.cleanerId}>{c.cleanerId || 'No ID'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Modal>

      {/* Restock Modal */}
      <Modal visible={restockVisible} transparent animationType="slide" onRequestClose={() => setRestockVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={modalStyles.title}>Restock Item</Text>
              <TouchableOpacity onPress={() => setRestockVisible(false)}>
                <Icon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>Add Quantity ({item.unit})</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="e.g. 50"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={restockQty}
              onChangeText={setRestockQty}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity style={[modalStyles.btn, modalStyles.cancelBtn]} onPress={() => setRestockVisible(false)}>
                <Text style={modalStyles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.btn, modalStyles.submitBtn]} onPress={handleRestock}>
                <Text style={modalStyles.submitTxt}>Restock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '92%', maxWidth: 450 },
  handle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderContainerWidth: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F8FAFC' },
  selectBtnTxt: { fontSize: 14, color: '#94A3B8' },
  input: { borderContainerWidth: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, padding: 0, fontSize: 14, color: '#1E293B' },
  cleanerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  cleanerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  cleanerName: { fontWeight: '600', color: '#1E293B', fontSize: 14 },
  cleanerId: { fontSize: 11, color: '#64748B', marginTop: 1 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  submitBtn: { backgroundColor: '#2563EB' },
  cancelTxt: { color: '#475569', fontWeight: '750' },
  submitTxt: { color: '#FFFFFF', fontWeight: '750' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  category: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize', fontFamily: 'Inter-Regular' },
  stockSection: { marginTop: 20 },
  stockBar: { height: 12, borderRadius: 6, marginBottom: 8 },
  stockFill: { height: 12, borderRadius: 6 },
  stockText: { fontSize: 14, fontWeight: '600', textAlign: 'center', fontFamily: 'Inter-SemiBold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  value: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF444410', borderColor: '#EF4444' },
  alertIcon: { fontSize: 24, marginRight: 12 },
  alertText: { flex: 1, fontSize: 14, color: '#EF4444', fontFamily: 'Inter-Medium' },
});

export default InventoryDetailScreen;

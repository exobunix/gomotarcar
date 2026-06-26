import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { RootState } from '../../redux/store';

interface Props { navigation: any; route: any }

const InventoryDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId } = route.params;
  const { items } = useSelector((s: RootState) => s.inventory);
  const item = items.find((i) => i._id === itemId);

  if (!item) return <View style={styles.container}><Header title="Item" onBack={() => navigation.goBack()} /></View>;

  const stockPercent = item.quantity > 0 ? (item.available / item.quantity) * 100 : 0;
  const isLowStock = item.available <= item.minStock;

  return (
    <View style={styles.container}>
      <Header title={item.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <View style={styles.stockSection}>
            <View style={[styles.stockBar, { backgroundColor: isLowStock ? '#EF444420' : '#22C55E20' }]}>
              <View style={[styles.stockFill, { width: `${stockPercent}%`, backgroundColor: isLowStock ? '#EF4444' : '#22C55E' }]} />
            </View>
            <Text style={[styles.stockText, { color: isLowStock ? '#EF4444' : '#22C55E' }]}>
              {item.available}/{item.quantity} {item.unit} available
            </Text>
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={{ marginTop: 16 }}>
          <View style={styles.row}><Text style={styles.label}>Total Quantity</Text><Text style={styles.value}>{item.quantity} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Allocated</Text><Text style={styles.value}>{item.allocated} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Available</Text><Text style={styles.value}>{item.available} {item.unit}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Min Stock Level</Text><Text style={[styles.value, isLowStock && { color: '#EF4444' }]}>{item.minStock} {item.unit}</Text></View>
        </Card>

        {isLowStock && (
          <Card variant="outlined" padding={16} style={[styles.alertCard]}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>Low stock alert! Only {item.available} {item.unit} remaining.</Text>
          </Card>
        )}

        <Button title="Allocate to Cleaner" size="lg" onPress={() => {}} style={{ marginTop: 16 }} />
        <Button title="Restock" variant="outline" size="lg" onPress={() => {}} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
};

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

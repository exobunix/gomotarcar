import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { customerService } from '../../services/customer.service';
import { maskPhone } from '../../utils/helpers';

interface Props { navigation: any; route: any }

const CustomerDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { customerId } = route.params;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    customerService.getById(customerId).then((r) => setCustomer(r.data)).catch(() => null);
  }, [customerId]);

  if (!customer) return <View style={styles.container}><Header title="Customer" onBack={() => navigation.goBack()} /></View>;

  return (
    <View style={styles.container}>
      <Header title="Customer Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(customer.name || '?')[0]}</Text></View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.phone}>{maskPhone(customer.phone)}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Details</Text>
        <Card variant="outlined" padding={16}>
          <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{maskPhone(customer.phone)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{customer.email || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Apartments</Text><Text style={styles.value}>{customer.apartments || 0}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Vehicles</Text><Text style={styles.value}>{customer.vehicles || 0}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Subscriptions</Text><Text style={styles.value}>{customer.subscriptions || 0}</Text></View>
        </Card>

        <Button title="Add Apartment" variant="outline" onPress={() => navigation.navigate('AddApartment', { customerId })} style={{ marginTop: 12 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  value: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
});

export default CustomerDetailScreen;

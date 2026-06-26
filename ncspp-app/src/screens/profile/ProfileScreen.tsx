import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { logout, updateProfile } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');

  const handleSave = async () => {
    await dispatch(updateProfile({ name, email, businessName }));
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const menuItems = [
    { icon: '🏪', label: 'Business Profile', action: () => setEditing(!editing) },
    { icon: '📋', label: 'GST Details', value: user?.gstNumber || 'Not verified', action: () => {} },
    { icon: '📊', label: 'Performance Stats', action: () => navigation.navigate('LeadAnalytics') },
    { icon: '💳', label: 'Payment Settings', action: () => navigation.navigate('Wallet') },
    { icon: '🔔', label: 'Notification Preferences', action: () => navigation.navigate('Notifications') },
    { icon: '❓', label: 'Help & Support', action: () => {} },
    { icon: 'ℹ️', label: 'About', action: () => {} },
  ];

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || 'P').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          {user?.businessName && (
            <Text style={styles.businessName}>{user.businessName}</Text>
          )}
          <StatusBadgeComponent gstVerified={user?.gstVerified} />
        </Card>

        {editing ? (
          <Card style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Profile</Text>
            <Input label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input label="Email" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" />
            <Input label="Business Name" value={businessName} onChangeText={setBusinessName}
              autoCapitalize="words" />
            <View style={styles.editActions}>
              <Button title="Cancel" onPress={() => setEditing(false)}
                variant="outline" size="medium" style={styles.editBtn} />
              <Button title="Save" onPress={handleSave}
                variant="primary" size="medium" style={styles.editBtn}
                disabled={!name} />
            </View>
          </Card>
        ) : (
          <Card style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={item.action}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.value && (
                  <Text style={styles.menuValue}>{item.value}</Text>
                )}
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="large"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const StatusBadgeComponent = ({ gstVerified }: { gstVerified?: boolean }) => (
  <View style={[
    styles.statusBadge,
    { backgroundColor: gstVerified ? '#E8F5E9' : '#FFF3E0' },
  ]}>
    <Text style={[
      styles.statusText,
      { color: gstVerified ? '#2E7D32' : '#E65100' },
    ]}>
      {gstVerified ? '✓ GST Verified' : '⚠ GST Not Verified'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },
  profileCard: { alignItems: 'center', padding: 24 },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  userName: { fontSize: 22, fontWeight: '700', color: colors.text },
  userPhone: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  businessName: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  statusBadge: {
    paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, marginTop: 12,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  editCard: {},
  editTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: { flex: 1 },
  menuCard: {},
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: colors.text },
  menuValue: { fontSize: 13, color: colors.textSecondary },
  menuArrow: { fontSize: 20, color: colors.textSecondary },
  logoutBtn: { marginTop: 8 },
});

export default ProfileScreen;

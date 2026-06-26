import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          value: pushNotifications,
          onChange: setPushNotifications,
          type: 'switch',
        },
        {
          label: 'SMS Updates',
          value: smsNotifications,
          onChange: setSmsNotifications,
          type: 'switch',
        },
        {
          label: 'Email Updates',
          value: emailNotifications,
          onChange: setEmailNotifications,
          type: 'switch',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          value: darkMode,
          onChange: setDarkMode,
          type: 'switch',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'FAQs', type: 'link', screen: 'FAQ' },
        { label: 'Contact Us', type: 'link', screen: 'Contact' },
        { label: 'Privacy Policy', type: 'link', screen: 'Privacy' },
        { label: 'Terms of Service', type: 'link', screen: 'Terms' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="elevated" padding={4}>
              {section.items.map((item: any, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingBorder,
                  ]}
                >
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onChange}
                      trackColor={{ false: colors.border, true: colors.lightBlue }}
                      thumbColor={item.value ? colors.primaryBlue : '#f4f3f4'}
                    />
                  ) : (
                    <TouchableOpacity>
                      <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Inter-Medium',
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;

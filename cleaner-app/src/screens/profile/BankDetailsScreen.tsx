import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const BankDetailsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Bank Details</Text>
            <Text style={styles.mainSubTitle}>Manage your bank account and payout information</Text>
          </View>
          <View style={styles.headerRightRow}>
            <Icon name="shield-check-outline" size={16} color="#FFF" />
            <Text style={styles.secureTxt}>Secure</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.hcTopHalf}>
            <View style={styles.hcAvatarWrapper}>
              <Image source={{uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.hcAvatar} />
              <View style={styles.hcCameraBadge}><Icon name="camera" size={12} color="#FFF" /></View>
            </View>
            <View style={styles.hcInfo}>
              <View style={styles.hcNameRow}>
                <Text style={styles.hcName}>Raj Kumar</Text>
                <Icon name="check-decagram" size={16} color="#2563EB" style={{marginLeft: 4}} />
              </View>
              <Text style={styles.hcRole}>Housekeeping Staff</Text>
              
              <View style={styles.hcMetaRow}>
                <Icon name="map-marker-outline" size={12} color="#64748B" />
                <Text style={styles.hcMetaTxt}>Sector 62, Noida</Text>
              </View>
              <View style={styles.hcMetaRow}>
                <Icon name="star" size={12} color="#EAB308" />
                <Text style={[styles.hcMetaTxt, {color: '#2563EB', fontWeight: '700'}]}>4.6 <Text style={{color: '#64748B', fontWeight: '500'}}>(126 Reviews)</Text></Text>
              </View>
            </View>

            <View style={styles.hcRightCol}>
              <View style={styles.verticalDivider} />
              <View style={styles.hcRightData}>
                <View style={styles.hcRightLblRow}>
                  <Icon name="badge-account-outline" size={12} color="#2563EB" style={{marginRight: 4}} />
                  <Text style={styles.hcRightLbl}>Employee ID</Text>
                </View>
                <Text style={styles.hcRightVal}>EMP100245</Text>
                
                <View style={[styles.hcRightLblRow, {marginTop: 8}]}>
                  <Icon name="calendar-outline" size={12} color="#2563EB" style={{marginRight: 4}} />
                  <Text style={styles.hcRightLbl}>Member Since</Text>
                </View>
                <Text style={styles.hcRightVal}>15 Jan 2024</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Account Details */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Icon name="plus" size={14} color="#2563EB" />
            <Text style={styles.addBtnTxt}>Add New Account</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContainer}>
          <View style={styles.primaryPill}>
            <Icon name="check-decagram" size={10} color="#16A34A" />
            <Text style={styles.primaryPillTxt}>Primary Account</Text>
          </View>

          <View style={styles.bankHeader}>
            <View style={styles.bankIconBg}><Icon name="bank-outline" size={24} color="#2563EB" /></View>
            <View style={styles.bankHeaderInfo}>
              <View style={styles.bankTitleRow}>
                <Text style={styles.bankTitle}>State Bank of India</Text>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillTxt}>Verified</Text>
                  <Icon name="check-circle-outline" size={10} color="#16A34A" />
                </View>
              </View>
              <Text style={styles.bankSub}>Savings Account</Text>
            </View>
          </View>

          <View style={styles.bankFieldRow}>
            <View style={styles.bankFieldInfo}>
              <Text style={styles.bankFieldLbl}>Account Number</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.bankFieldVal}>XXXX XXXX 5678</Text>
                <Icon name="eye-outline" size={16} color="#2563EB" style={{marginLeft: 8}} />
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>

          <View style={styles.bankFieldRow}>
            <View style={styles.bankFieldInfo}>
              <Text style={styles.bankFieldLbl}>IFSC Code</Text>
              <Text style={styles.bankFieldVal}>SBIN0001234</Text>
            </View>
          </View>

          <View style={styles.bankFieldRow}>
            <View style={styles.bankFieldInfo}>
              <Text style={styles.bankFieldLbl}>Account Holder Name</Text>
              <Text style={styles.bankFieldVal}>Raj Kumar</Text>
            </View>
          </View>

          <View style={styles.bankFooter}>
            <Icon name="shield-check-outline" size={16} color="#2563EB" />
            <Text style={styles.bankFooterTxt}>This account will be used for salary and other payments.</Text>
          </View>
        </View>

        {/* UPI Details */}
        <View style={[styles.sectionHeaderRow, {marginTop: 8}]}>
          <Text style={styles.sectionTitle}>UPI Details</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Icon name="plus" size={14} color="#2563EB" />
            <Text style={styles.addBtnTxt}>Add UPI ID</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDesc}>Receive payments directly in your bank account via UPI.</Text>

        <View style={[styles.cardContainer, {padding: 16, flexDirection: 'row', alignItems: 'center'}]}>
          <View style={styles.upiIconBg}>
            <View style={styles.upiLogoMock} />
          </View>
          <View style={styles.upiInfo}>
            <Text style={styles.upiLbl}>UPI ID</Text>
            <View style={styles.upiValRow}>
              <Text style={styles.upiVal}>rajkumar@oksbi</Text>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillTxt}>Verified</Text>
              </View>
            </View>
            <Text style={styles.upiLinkedTxt}>Linked to: State Bank of India - XXXX 5678</Text>
          </View>
          <TouchableOpacity><Icon name="dots-vertical" size={20} color="#64748B" /></TouchableOpacity>
        </View>

        {/* Payout Preferences */}
        <TouchableOpacity style={styles.prefCard}>
          <View style={styles.prefIconBg}><Icon name="cash-multiple" size={24} color="#2563EB" /></View>
          <View style={styles.prefInfo}>
            <Text style={styles.prefTitle}>Payout Preferences</Text>
            <Text style={styles.prefDesc}>Set your preferred payout method and schedule.</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Important Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Important Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Icon name="lock-outline" size={16} color="#16A34A" style={styles.infoItemIcon} />
              <Text style={styles.infoItemTxt}>Your bank details are encrypted and secure.</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="information-outline" size={16} color="#EA580C" style={styles.infoItemIcon} />
              <Text style={styles.infoItemTxt}>Ensure your account details are correct to avoid payment failures.</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="calendar-outline" size={16} color="#2563EB" style={styles.infoItemIcon} />
              <Text style={styles.infoItemTxt}>Salary is typically credited between 1st to 5th of every month.</Text>
            </View>
          </View>
        </View>

        {/* Bottom Support Banner */}
        <View style={styles.supportBanner}>
          <View style={styles.sbIconBg}><Icon name="headset" size={20} color="#2563EB" /></View>
          <View style={styles.sbInfo}>
            <Text style={styles.sbTitle}>Need help with your bank details?</Text>
            <Text style={styles.sbSub}>Contact our support team</Text>
          </View>
          <TouchableOpacity><Text style={styles.sbLinkTxt}>Contact Support ›</Text></TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
    position: 'relative',
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  secureTxt: { fontSize: 12, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginLeft: 4 },

  scrollView: { flex: 1, marginTop: -15, position: 'relative', zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  hcTopHalf: { flexDirection: 'row', alignItems: 'center' },
  hcAvatarWrapper: { marginRight: 12, position: 'relative' },
  hcAvatar: { width: 64, height: 64, borderRadius: 32 },
  hcCameraBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#2563EB', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  hcInfo: { flex: 1, justifyContent: 'center' },
  hcNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcName: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  hcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 6 },
  hcMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  
  hcRightCol: { width: 110, alignItems: 'center', paddingLeft: 12, position: 'relative' },
  verticalDivider: { position: 'absolute', left: 0, top: -10, bottom: -10, width: 1, backgroundColor: '#E2E8F0' },
  hcRightData: { width: '100%' },
  hcRightLblRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcRightLbl: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium' },
  hcRightVal: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  addBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },
  sectionDesc: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginBottom: 16, marginTop: -8 },

  cardContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 20 },
  primaryPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  primaryPillTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginLeft: 4 },

  bankHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  bankIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bankHeaderInfo: { flex: 1 },
  bankTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  bankTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginRight: 8 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BBF7D0' },
  verifiedPillTxt: { fontSize: 8, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginRight: 2 },
  bankSub: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium' },

  bankFieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 4 },
  bankFieldInfo: { flex: 1 },
  bankFieldLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 4 },
  bankFieldVal: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },

  bankFooter: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  bankFooterTxt: { fontSize: 10, color: '#1E3A8A', fontFamily: 'Inter-Medium', marginLeft: 8 },

  upiIconBg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  upiLogoMock: { width: 20, height: 20, borderLeftWidth: 10, borderBottomWidth: 10, borderLeftColor: '#F59E0B', borderBottomColor: '#10B981', transform: [{rotate: '45deg'}] }, // Fake logo shape
  upiInfo: { flex: 1 },
  upiLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 2 },
  upiValRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  upiVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginRight: 8 },
  upiLinkedTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular' },

  prefCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, alignItems: 'center', marginBottom: 20 },
  prefIconBg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  prefInfo: { flex: 1 },
  prefTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  prefDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },

  infoBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  infoBoxTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 12 },
  infoList: {},
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoItemIcon: { marginTop: 2, marginRight: 10 },
  infoItemTxt: { flex: 1, fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', lineHeight: 18 },

  supportBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  sbIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sbInfo: { flex: 1 },
  sbTitle: { fontSize: 11, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  sbSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium' },
  sbLinkTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
});

export default BankDetailsScreen;

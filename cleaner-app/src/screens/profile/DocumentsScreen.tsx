import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const DocumentsScreen: React.FC<Props> = ({ navigation }) => {

  const documents = [
    { id: 1, title: 'Aadhaar Card', sub: 'XXXX XXXX 5678', uploadDate: '12 May 2025', size: '1.2 MB', validTill: '25 Mar 2030', status: 'Verified', icon: 'card-account-details-outline', color: '#2563EB', bg: '#EFF6FF' },
    { id: 2, title: 'PAN Card', sub: 'ABCDE1234F', uploadDate: '12 May 2025', size: '688 KB', validTill: '--', status: 'Verified', icon: 'card-text-outline', color: '#16A34A', bg: '#F0FDF4' },
    { id: 3, title: 'Education Certificate (10th)', sub: 'CBSE Board', uploadDate: '10 May 2025', size: '1.5 MB', validTill: '--', status: 'Verified', icon: 'school-outline', color: '#9333EA', bg: '#FAF5FF' },
    { id: 4, title: 'Police Verification', sub: 'UPPVR/2025/4587', uploadDate: '08 May 2025', size: '1.1 MB', validTill: 'Under Review', status: 'Pending', icon: 'shield-outline', color: '#EA580C', bg: '#FFF7ED' },
    { id: 5, title: 'Medical Certificate', sub: 'MC/2025/2214', uploadDate: '08 May 2025', size: '967 KB', validTill: 'Under Review', status: 'Pending', icon: 'hospital-box-outline', color: '#DC2626', bg: '#FEF2F2' },
    { id: 6, title: 'Experience Letter', sub: 'ABC Services Pvt. Ltd.', uploadDate: '05 May 2025', size: '1.3 MB', validTill: '--', status: 'Verified', icon: 'briefcase-outline', color: '#2563EB', bg: '#EFF6FF' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Documents</Text>
            <Text style={styles.mainSubTitle}>Upload and manage your documents</Text>
          </View>
          <TouchableOpacity style={styles.headerRightRow}>
            <Icon name="cloud-upload-outline" size={18} color="#FFF" />
            <Text style={styles.uploadNewTxt}>Upload New</Text>
          </TouchableOpacity>
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

        {/* Document Overview Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Document Overview</Text>
          <TouchableOpacity><Text style={styles.viewExpTxt}>View Expired ›</Text></TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCol}>
            <View style={[styles.statIconBg, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}><Icon name="file-document-outline" size={20} color="#2563EB" /></View>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statSub}>Total Documents</Text>
          </View>
          <View style={styles.statCol}>
            <View style={[styles.statIconBg, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}><Icon name="check-circle-outline" size={20} color="#16A34A" /></View>
            <Text style={styles.statVal}>10</Text>
            <Text style={[styles.statSub, {color: '#16A34A'}]}>Verified</Text>
          </View>
          <View style={styles.statCol}>
            <View style={[styles.statIconBg, {backgroundColor: '#FFF7ED', borderColor: '#FED7AA'}]}><Icon name="clock-outline" size={20} color="#EA580C" /></View>
            <Text style={styles.statVal}>2</Text>
            <Text style={[styles.statSub, {color: '#EA580C'}]}>Pending</Text>
          </View>
          <View style={styles.statCol}>
            <View style={[styles.statIconBg, {backgroundColor: '#FEF2F2', borderColor: '#FECACA'}]}><Icon name="alert-circle-outline" size={20} color="#DC2626" /></View>
            <Text style={styles.statVal}>0</Text>
            <Text style={[styles.statSub, {color: '#DC2626'}]}>Expired</Text>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>My Documents</Text>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput placeholder="Search documents" placeholderTextColor="#94A3B8" style={styles.searchInput} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Document List */}
        <View style={styles.listContainer}>
          {documents.map((doc, i) => (
            <View key={doc.id} style={[styles.docRow, i !== documents.length - 1 && styles.borderBtm]}>
              <View style={[styles.docIconBg, {backgroundColor: doc.bg}]}><Icon name={doc.icon} size={24} color={doc.color} /></View>
              
              <View style={styles.docInfoCol}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  {doc.status === 'Verified' ? (
                    <View style={styles.verifiedPill}>
                      <Text style={styles.verifiedPillTxt}>Verified</Text>
                      <Icon name="check-circle-outline" size={10} color="#16A34A" />
                    </View>
                  ) : (
                    <View style={styles.pendingPill}>
                      <Text style={styles.pendingPillTxt}>Pending</Text>
                      <Icon name="clock-outline" size={10} color="#EA580C" />
                    </View>
                  )}
                </View>
                
                <Text style={styles.docSub}>{doc.sub}</Text>
                
                <View style={styles.docMetaRow}>
                  <View style={styles.docMetaLeft}>
                    <Text style={styles.docMetaTxt}>Uploaded on {doc.uploadDate}</Text>
                    <View style={styles.dotDivider} />
                    <Text style={styles.docMetaTxt}>{doc.size}</Text>
                  </View>
                  
                  {doc.status === 'Verified' ? (
                    <Text style={styles.docMetaTxt}>Valid till {doc.validTill}</Text>
                  ) : (
                    <Text style={[styles.docMetaTxt, {color: '#EA580C'}]}>{doc.validTill}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.moreBtn}><Icon name="dots-vertical" size={20} color="#94A3B8" /></TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.listFooterInfo}>
            <Icon name="information-outline" size={16} color="#2563EB" style={{marginRight: 8}} />
            <Text style={styles.listFooterTxt}>Make sure your documents are valid and up to date.</Text>
          </View>
        </View>

        {/* Bottom Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.sbIconBg}><Icon name="shield-check-outline" size={24} color="#2563EB" /></View>
          <View style={styles.sbInfo}>
            <Text style={styles.sbTitle}>Your documents are secure</Text>
            <Text style={styles.sbSub}>We keep your documents safe and private.</Text>
          </View>
          <TouchableOpacity><Text style={styles.sbLinkTxt}>Learn More ›</Text></TouchableOpacity>
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
  headerRightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingRight: 4 },
  uploadNewTxt: { fontSize: 12, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginLeft: 4 },

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
  viewExpTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCol: { width: '23.5%', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  statIconBg: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  statSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center' },

  listHeaderRow: { marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', height: 40, marginRight: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 12, color: '#0F172A', fontFamily: 'Inter-Regular' },
  filterBtn: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },

  listContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, marginBottom: 16 },
  borderBtm: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16 },
  docIconBg: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docInfoCol: { flex: 1 },
  docTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  docTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BBF7D0' },
  verifiedPillTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginRight: 2 },
  pendingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FED7AA' },
  pendingPillTxt: { fontSize: 9, fontWeight: '700', color: '#EA580C', fontFamily: 'Inter-Bold', marginRight: 2 },
  
  docSub: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 8 },
  
  docMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docMetaLeft: { flexDirection: 'row', alignItems: 'center' },
  docMetaTxt: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Regular' },
  dotDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 6 },
  
  moreBtn: { marginLeft: 8 },

  listFooterInfo: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  listFooterTxt: { fontSize: 10, color: '#1E3A8A', fontFamily: 'Inter-Medium' },

  securityBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  sbIconBg: { marginRight: 12 },
  sbTitle: { fontSize: 12, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  sbSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium' },
  sbLinkTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
});

export default DocumentsScreen;

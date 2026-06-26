import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../redux/store';

interface Props { navigation: any }

const PersonalInformationScreen: React.FC<Props> = ({ navigation }) => {
  const { cleaner } = useSelector((state: RootState) => state.auth);
  
  const [firstName, setFirstName] = useState(cleaner?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(cleaner?.name?.split(' ')[1] || '');
  const [phone, setPhone] = useState(cleaner?.phone || '');
  const [email, setEmail] = useState(cleaner?.email || '');
  const [dob, setDob] = useState('15/08/1990');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('123, Sector 62, Noida, UP - 201309');

  const handleSave = () => {
    // API call to update profile
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Personal Information</Text>
            <Text style={styles.mainSubTitle}>Update your personal details</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.hcTopHalf}>
            <View style={styles.hcAvatarWrapper}>
              <Image source={{uri: cleaner?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.hcAvatar} />
              <View style={styles.hcCameraBadge}><Icon name="camera" size={14} color="#FFF" /></View>
            </View>
            <View style={styles.hcInfo}>
              <View style={styles.hcNameRow}>
                <Text style={styles.hcName}>{cleaner?.name || 'User'}</Text>
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

            <TouchableOpacity style={styles.changePhotoBtn}>
              <Icon name="camera-outline" size={14} color="#2563EB" style={{marginRight: 4}} />
              <Text style={styles.changePhotoTxt}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnTxt}>Edit</Text>
            <Icon name="pencil-outline" size={14} color="#2563EB" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Icon name="account-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Full Name</Text>
            <Text style={styles.listVal}>{firstName} {lastName}</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="calendar-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Date of Birth</Text>
            <Text style={styles.listVal}>{dob}</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="gender-male" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Gender</Text>
            <Text style={styles.listVal}>{gender}</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="email-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Email Address</Text>
            <Text style={styles.listVal}>{email}</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="phone-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Mobile Number</Text>
            <Text style={styles.listVal}>{phone}</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="water-outline" size={18} color="#DC2626" style={styles.listIcon} />
            <Text style={styles.listLbl}>Blood Group</Text>
            <Text style={styles.listVal}>B+</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="account-group-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Emergency Contact</Text>
            <Text style={styles.listVal}>Suresh Kumar (Father) - +91 98765 43211</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="home-outline" size={18} color="#2563EB" style={styles.listIcon} />
            <Text style={styles.listLbl}>Current Address</Text>
            <Text style={[styles.listVal, {lineHeight: 18}]}>A-1204, Supertech Eco Village 2,{"\n"}Sector 62, Noida, Uttar Pradesh - 201309</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
        </View>

        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Icon name="flag-outline" size={18} color="#16A34A" style={styles.listIcon} />
            <Text style={styles.listLbl}>Nationality</Text>
            <Text style={styles.listVal}>Indian</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="heart-outline" size={18} color="#DC2626" style={styles.listIcon} />
            <Text style={styles.listLbl}>Marital Status</Text>
            <Text style={styles.listVal}>Single</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="message-text-outline" size={18} color="#0EA5E9" style={styles.listIcon} />
            <Text style={styles.listLbl}>Languages Known</Text>
            <Text style={styles.listVal}>Hindi, English</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listItem}>
            <Icon name="star-outline" size={18} color="#EA580C" style={styles.listIcon} />
            <Text style={styles.listLbl}>Hobbies</Text>
            <Text style={styles.listVal}>Reading, Playing Cricket</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </View>

        {/* Bottom Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.sbIconBg}><Icon name="shield-check-outline" size={24} color="#2563EB" /></View>
          <View style={styles.sbInfo}>
            <Text style={styles.sbTitle}>Your information is secure</Text>
            <Text style={styles.sbSub}>We ensure the safety and privacy of your personal data.</Text>
          </View>
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
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  headerTitles: { flex: 1, marginLeft: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },

  scrollView: { flex: 1, marginTop: -15, position: 'relative', zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  hcTopHalf: { flexDirection: 'row', alignItems: 'center' },
  hcAvatarWrapper: { marginRight: 16, position: 'relative' },
  hcAvatar: { width: 64, height: 64, borderRadius: 32 },
  hcCameraBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#2563EB', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  hcInfo: { flex: 1, justifyContent: 'center' },
  hcNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcName: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  hcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 6 },
  hcMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  changePhotoTxt: { fontSize: 10, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  editBtn: { flexDirection: 'row', alignItems: 'center' },
  editBtnTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  listContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16, paddingHorizontal: 16 },
  listIcon: { marginRight: 12, marginTop: 2 },
  listLbl: { width: 100, fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 2 },
  listVal: { flex: 1, fontSize: 12, color: '#0F172A', fontFamily: 'Inter-Medium', marginTop: 2, paddingRight: 8 },
  listDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  securityBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  sbIconBg: { marginRight: 12 },
  sbTitle: { fontSize: 12, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  sbSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium' },
});

export default PersonalInformationScreen;

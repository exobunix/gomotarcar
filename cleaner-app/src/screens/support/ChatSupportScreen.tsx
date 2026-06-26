import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const ChatSupportScreen: React.FC<Props> = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Chat Support</Text>
            <Text style={styles.mainSubTitle}>We're here to help you</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="dots-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Support Profile Card */}
      <View style={styles.topCard}>
        <View style={styles.tcHeaderContent}>
          <View style={styles.avatarContainer}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.avatarImg} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.tcInfo}>
            <Text style={styles.tcName}>Priya Singh</Text>
            <View style={styles.roleRow}>
              <Text style={styles.tcRole}>Support Executive</Text>
              <View style={styles.activeBadge}><Text style={styles.activeBadgeTxt}>Online</Text></View>
            </View>
            <View style={styles.timeRow}>
              <Icon name="clock-outline" size={12} color="#64748B" />
              <Text style={styles.timeTxt}>Typically replies in 2 mins</Text>
            </View>
          </View>
          
          <View style={styles.tcRightBtns}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="phone-outline" size={20} color="#2563EB" /></View>
              <Text style={styles.actionLbl}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RaiseTicket')}>
              <View style={[styles.actionIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="file-document-outline" size={20} color="#2563EB" /></View>
              <Text style={styles.actionLbl}>Create Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Alert Banner */}
        {showAlert && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBg}><Icon name="bullhorn-outline" size={18} color="#FFF" /></View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Need immediate help?</Text>
              <Text style={styles.alertSub}>Our support team is available 24/7 to assist you.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAlert(false)}>
              <Icon name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Thread */}
        <View style={styles.dateSeparator}>
          <View style={styles.datePill}><Text style={styles.datePillTxt}>Today, 15 May 2025</Text></View>
        </View>

        {/* Message User */}
        <View style={styles.msgWrapperRight}>
          <View style={styles.bubbleBlue}>
            <Text style={styles.bubbleBlueTxt}>Hi, I need help with a task. The customer was not available at the time of service. What should I do?</Text>
          </View>
          <View style={styles.msgStatusRowRight}>
            <Text style={styles.msgTime}>10:30 AM</Text>
            <Icon name="check-all" size={12} color="#2563EB" style={{marginLeft: 4}} />
          </View>
        </View>

        {/* Message Support */}
        <View style={styles.msgWrapperLeft}>
          <Image source={{uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.msgAvatar} />
          <View style={{flex: 1}}>
            <View style={styles.bubbleGrey}>
              <Text style={styles.bubbleGreyTxt}>Hello Rohit! 👋{'\n'}If the customer was not available, please mark the task as "Customer Not Available" and reschedule as per their convenience.</Text>
            </View>
            <Text style={styles.msgTimeLeft}>10:31 AM</Text>
          </View>
        </View>

        {/* Message User */}
        <View style={styles.msgWrapperRight}>
          <View style={styles.bubbleBlue}>
            <Text style={styles.bubbleBlueTxt}>Okay, got it. Will I be able to reschedule from the app?</Text>
          </View>
          <View style={styles.msgStatusRowRight}>
            <Text style={styles.msgTime}>10:32 AM</Text>
            <Icon name="check-all" size={12} color="#2563EB" style={{marginLeft: 4}} />
          </View>
        </View>

        {/* Message Support */}
        <View style={styles.msgWrapperLeft}>
          <Image source={{uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.msgAvatar} />
          <View style={{flex: 1}}>
            <View style={styles.bubbleGrey}>
              <Text style={styles.bubbleGreyTxt}>Yes, you can. Go to the task details, select "Reschedule" and choose a new date & time.</Text>
            </View>
            <Text style={styles.msgTimeLeft}>10:33 AM</Text>
          </View>
        </View>

        {/* Message User */}
        <View style={styles.msgWrapperRight}>
          <View style={styles.bubbleBlue}>
            <Text style={styles.bubbleBlueTxt}>Thanks! That helped. 😊</Text>
          </View>
          <View style={styles.msgStatusRowRight}>
            <Text style={styles.msgTime}>10:33 AM</Text>
            <Icon name="check-all" size={12} color="#2563EB" style={{marginLeft: 4}} />
          </View>
        </View>

        {/* Feedback Widget */}
        <View style={styles.feedbackWidget}>
          <View style={styles.fbIconBg}><Icon name="message-smile-outline" size={24} color="#FFF" /></View>
          <View style={styles.fbInfo}>
            <Text style={styles.fbTitle}>How was your support experience?</Text>
            <Text style={styles.fbSub}>Your feedback helps us improve our service.</Text>
          </View>
          <View style={styles.fbBtnsRow}>
            <TouchableOpacity style={styles.fbBtn}><Icon name="thumb-up-outline" size={20} color="#64748B" /></TouchableOpacity>
            <TouchableOpacity style={styles.fbBtn}><Icon name="thumb-down-outline" size={20} color="#64748B" /></TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.attachBtn}>
          <Icon name="paperclip" size={24} color="#64748B" />
        </TouchableOpacity>
        <View style={styles.inputBoxBg}>
          <TextInput 
            style={styles.textInput} 
            placeholder="Type your message..." 
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Icon name="send" size={18} color="#FFF" style={{transform: [{rotate: '-45deg'}], marginTop: -2, marginLeft: 2}} />
          </TouchableOpacity>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, marginTop: -40, marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 12, zIndex: 20 },
  tcHeaderContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#16A34A', borderWidth: 2, borderColor: '#FFF' },
  tcInfo: { flex: 1 },
  tcName: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginRight: 8 },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  tcRightBtns: { flexDirection: 'row' },
  actionBtn: { alignItems: 'center', marginLeft: 16 },
  actionIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionLbl: { fontSize: 9, fontWeight: '600', color: '#475569', fontFamily: 'Inter-SemiBold' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  alertBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20 },
  alertIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 12, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold' },
  alertSub: { fontSize: 11, color: '#1E3A8A', fontFamily: 'Inter-Medium', marginTop: 2 },

  dateSeparator: { alignItems: 'center', marginBottom: 20 },
  datePill: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  datePillTxt: { fontSize: 10, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },

  msgWrapperRight: { alignItems: 'flex-end', marginBottom: 16 },
  bubbleBlue: { backgroundColor: '#0D5BD7', padding: 14, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '85%' },
  bubbleBlueTxt: { fontSize: 13, color: '#FFF', fontFamily: 'Inter-Medium', lineHeight: 18 },
  msgStatusRowRight: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  msgTime: { fontSize: 10, color: '#94A3B8', fontFamily: 'Inter-Medium' },

  msgWrapperLeft: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, maxWidth: '85%' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginBottom: 20 },
  bubbleGrey: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 16, borderBottomLeftRadius: 4 },
  bubbleGreyTxt: { fontSize: 13, color: '#0F172A', fontFamily: 'Inter-Medium', lineHeight: 20 },
  msgTimeLeft: { fontSize: 10, color: '#94A3B8', fontFamily: 'Inter-Medium', marginTop: 4, marginLeft: 4 },

  feedbackWidget: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  fbIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fbInfo: { flex: 1 },
  fbTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  fbSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  fbBtnsRow: { flexDirection: 'row' },
  fbBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  attachBtn: { padding: 8, marginRight: 8 },
  inputBoxBg: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 24, paddingLeft: 16, paddingRight: 4, height: 48 },
  textInput: { flex: 1, fontSize: 13, color: '#0F172A', fontFamily: 'Inter-Medium' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
});

export default ChatSupportScreen;

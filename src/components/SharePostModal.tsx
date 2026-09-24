import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthUserId } from '../api/authStore';

interface TeamMember {
  _id: string;
  fullName: string;
  role: string;
}

interface Post {
  _id: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
}

interface SharePostModalProps {
  visible: boolean;
  post: Post | null;
  groupId: string;
  onClose: () => void;
}

export default function SharePostModal({ visible, post, groupId, onClose }: SharePostModalProps) {
  const [professionals, setProfessionals] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState<'options' | 'professionals'>('options');

  useEffect(() => {
    if (visible && view === 'options') {
      fetchProfessionals();
    }
  }, [visible, view]);

  const fetchProfessionals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/communities/team`);
      if (res.ok) {
        const data = await res.json();
        setProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.warn('Failed to fetch professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalShare = async () => {
    if (!post) return;
    try {
      const author = post.isAnonymous ? 'Anonymous Member' : post.authorName;
      const message = `Check out this post by ${author}:\n\n"${post.content}"`;
      
      await Share.share({
        message,
        title: 'Share Post',
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSendToProfessional = async (professional: TeamMember) => {
    if (!post || isSending) return;
    setIsSending(true);
    const userId = getAuthUserId();
    
    try {
      // 1. Create or get conversation
      const convRes = await fetch(`${COMMUNITY_API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participants: [userId || 'guest', professional._id],
          title: professional.fullName,
          lastMessageText: 'Shared a post',
          lastMessageSender: 'You',
        }),
      });

      if (!convRes.ok) throw new Error('Failed to create conversation');
      const conv = await convRes.json();

      // 2. Send the message
      const msgRes = await fetch(`${COMMUNITY_API_BASE}/conversations/${conv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'You', 
          text: `I wanted to share this post with you for advice:\n\n"${post.content}"`,
          isOwn: true,
        }),
      });

      if (!msgRes.ok) throw new Error('Failed to send message');

      Alert.alert('Success', `Post shared with ${professional.fullName}. You can continue the conversation in Messages.`);
      onClose();
      setTimeout(() => setView('options'), 300);
    } catch (error) {
      Alert.alert('Error', 'Could not share post with professional. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setView('options'), 300);
  };

  if (!visible || !post) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={handleClose} />
        
        <View style={s.sheet}>
          <View style={s.dragHandle} />
          
          {view === 'options' ? (
            <>
              <Text style={s.title}>Share Post</Text>
              
              <Pressable style={s.optionBtn} onPress={handleExternalShare}>
                <View style={[s.iconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Feather name="share" size={20} color="#0EA5E9" />
                </View>
                <View style={s.optionTextCol}>
                  <Text style={s.optionTitle}>Share via...</Text>
                  <Text style={s.optionSub}>Send to external apps or copy link</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#C0C0D8" />
              </Pressable>

              <Pressable style={s.optionBtn} onPress={() => setView('professionals')}>
                <View style={[s.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Feather name="star" size={20} color="#8B5CF6" />
                </View>
                <View style={s.optionTextCol}>
                  <Text style={s.optionTitle}>Send to a Professional</Text>
                  <Text style={s.optionSub}>Share privately for medical advice</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#C0C0D8" />
              </Pressable>
            </>
          ) : (
            <>
              <View style={s.headerRow}>
                <Pressable onPress={() => setView('options')} style={s.backBtn} hitSlop={10}>
                  <Feather name="arrow-left" size={20} color="#0D0D1A" />
                </Pressable>
                <Text style={s.title}>Select Professional</Text>
              </View>

              {isLoading ? (
                <View style={s.centered}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={s.loadingText}>Finding professionals...</Text>
                </View>
              ) : professionals.length === 0 ? (
                <View style={s.centered}>
                  <Text style={s.loadingText}>No professionals available right now.</Text>
                </View>
              ) : (
                <ScrollView style={s.profList} showsVerticalScrollIndicator={false}>
                  {professionals.map(prof => (
                    <Pressable
                      key={prof._id}
                      style={s.profCard}
                      onPress={() => handleSendToProfessional(prof)}
                      disabled={isSending}
                    >
                      <View style={s.profAvatar}>
                        <Feather name="user" size={18} color="#8B5CF6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.profName}>{prof.fullName}</Text>
                        <Text style={s.profRole}>Medical Professional</Text>
                      </View>
                      {isSending ? (
                        <ActivityIndicator size="small" color="#8B5CF6" />
                      ) : (
                        <Feather name="send" size={16} color="#C0C0D8" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  backdrop: { ...(StyleSheet.absoluteFill as any) },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, minHeight: 250 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
  
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0D0D1A', marginBottom: 16, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  backBtn: { position: 'absolute', left: 0, zIndex: 10, padding: 4 },
  
  optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionTextCol: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#0D0D1A', marginBottom: 2 },
  optionSub: { fontSize: 13, color: '#8A8A9E', fontWeight: '500' },
  
  centered: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  loadingText: { color: '#8A8A9E', fontSize: 14, fontWeight: '500' },
  
  profList: { maxHeight: 300 },
  profCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FC', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ECEEF8' },
  profAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE8FA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  profName: { fontSize: 14, fontWeight: '700', color: '#0D0D1A', marginBottom: 2 },
  profRole: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
});

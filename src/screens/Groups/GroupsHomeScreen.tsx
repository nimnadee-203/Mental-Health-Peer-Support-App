import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import type { Community } from '../GroupDiscussionScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GroupsHomeScreenProps {
  communities: Community[];
  joinedIds: string[];
  onGroupPress: (community: Community) => void;
  onCreateGroup: () => void;
}
const CATEGORIES = [
  'All',
  'General Wellbeing',
  'Relationships',
  'Mindfulness',
  'Academic Pressure',
  'Stress & Anxiety',
  'Self-Care',
  'Depression',
];


// ─── Component ────────────────────────────────────────────────────────────────
const GroupsHomeScreen = ({
  communities,
  joinedIds,
  onGroupPress,
  onCreateGroup,
}: GroupsHomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const joinedCommunities = communities.filter(c => joinedIds.includes(c._id));

  const filteredCommunities = communities.filter(c => {
    const matchesCategory =
      activeCategory === 'All' ||
      c.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Find Your Community</Text>
        <Pressable
  style={styles.createButton}
  onPress={onCreateGroup}
>
  <Text style={styles.createButtonText}>+ Create</Text>
</Pressable>
      </View>

      <Text style={styles.subtitle}>
        Connect with people who understand what you're going through.
      </Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search groups..."
        placeholderTextColor="#8A94A6"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}>
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.categoryTab, activeCategory === cat && styles.activeCategory]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Scrollable content */}
      <ScrollView
        style={styles.groupsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.groupsContainer}>

        {/* YOUR GROUPS */}
        {joinedCommunities.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>YOUR GROUPS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yourGroupsRow}>
              {joinedCommunities.map(c => (
                <Pressable
                  key={c._id}
                  style={[styles.yourGroupCard, { backgroundColor: c.bgColor }]}
                  onPress={() => onGroupPress(c)}>
                  <Text style={styles.yourGroupEmoji}>{c.emoji}</Text>
                  <Text style={styles.yourGroupName} numberOfLines={2}>{c.name}</Text>
                  <Text style={styles.yourGroupMembers}>{c.memberCount} members</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* ALL COMMUNITIES */}
        <Text style={styles.sectionTitle}>ALL COMMUNITIES</Text>

        {filteredCommunities.map(community => {
          const isJoined = joinedIds.includes(community._id);
          return (
            <Pressable
              key={community._id}
              style={styles.groupCard}
              onPress={() => onGroupPress(community)}>

              <View style={styles.groupTop}>
                <View style={[styles.groupImage, { backgroundColor: community.bgColor }]}>
                  <Text style={styles.groupImageText}>{community.emoji}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupCategory}>{community.category.toUpperCase()}</Text>
                  <Text style={styles.groupTitle}>{community.name}</Text>
                </View>
              </View>

              <Text style={styles.groupDescription}>{community.description}</Text>

              <View style={styles.groupBottom}>
                {/* Member avatars */}
                <View style={styles.avatarStack}>
                  {community.memberAvatarColors.slice(0, 3).map((color, i) => (
                    <View
                      key={i}
                      style={[
                        styles.miniAvatar,
                        { backgroundColor: color, marginLeft: i === 0 ? 0 : -8 },
                      ]}
                    />
                  ))}
                  <Text style={styles.memberCountText}>{community.memberCount} members</Text>
                </View>

                <View style={[styles.joinBadge, isJoined && styles.joinBadgeJoined]}>
                  <Text style={[styles.joinBadgeText, isJoined && styles.joinBadgeTextJoined]}>
                    {isJoined ? 'Joined ✓' : 'Join'}
                  </Text>
                </View>
              </View>

            </Pressable>
          );
        })}

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    color: '#667085',
    marginHorizontal: 20,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#2673FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#F8F9FB',
    fontSize: 14,
    color: '#1F2937',
  },
  categoryScroll: {
    marginTop: 16,
    flexGrow: 0,
  },
  categoryContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategory: {
    backgroundColor: '#2673FF',
    color: '#FFFFFF',
  },
  groupsScroll: {
    flex: 1,
    marginTop: 8,
  },
  groupsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#667085',
    letterSpacing: 0.8,
  },
  yourGroupsRow: {
    gap: 12,
    paddingBottom: 4,
  },
  yourGroupCard: {
    width: 130,
    borderRadius: 16,
    padding: 14,
  },
  yourGroupEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  yourGroupName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 18,
  },
  yourGroupMembers: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  groupTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupImageText: {
    fontSize: 26,
  },
  groupInfo: {
    flex: 1,
  },
  groupCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2673FF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  groupDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#667085',
    marginTop: 10,
  },
  groupBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCountText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  joinBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#2673FF',
  },
  joinBadgeJoined: {
    borderColor: '#2673FF',
    backgroundColor: '#EEF4FF',
  },
  joinBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  joinBadgeTextJoined: {
    color: '#2673FF',
  },
});

export default GroupsHomeScreen;
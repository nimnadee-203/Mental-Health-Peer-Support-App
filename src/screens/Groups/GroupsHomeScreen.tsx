import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';

type Group = {
  groupName: string;
  category: string;
  description: string;
  guidelines: string;
  emoji: string;
};

type GroupsHomeScreenProps = {
  joinedGroups: Group[];

  onCreateGroup: () => void;

  onOpenGroup: (group: Group) => void;

  onLeaveGroup: (groupName: string) => void;
};

const GroupsHomeScreen = ({
  onCreateGroup,
  onOpenGroup,
  joinedGroups,
  onLeaveGroup,
}: GroupsHomeScreenProps) => {
  const allGroups: Group[] = [
    {
      groupName: 'Managing Academic Stress',
      category: 'Academic Pressure',
      description:
        'A supportive space to share experiences and learn ways to manage academic pressure.',
      guidelines:
        'Be respectful, supportive, and avoid judging others. Do not share personal information outside the group.',
      emoji: '📚',
    },
    {
      groupName: 'Calm Minds Community',
      category: 'Stress & Anxiety',
      description:
        'A safe community to share feelings, coping strategies, and everyday experiences.',
      guidelines:
        'Be respectful and supportive. Listen to others without judgement and keep shared experiences private.',
      emoji: '🧘',
    },
    {
      groupName: 'Mindfulness & Self-Care',
      category: 'Self-Care',
      description:
        'Discover simple self-care habits and mindfulness practices together with others.',
      guidelines:
        'Share helpful experiences, respect different routines, and encourage positive self-care practices.',
      emoji: '🌿',
    },
    {
      groupName: 'You Are Not Alone',
      category: 'Depression Support',
      description:
        'A welcoming space for people to connect, listen, and support one another.',
      guidelines:
        'Be kind and respectful. Avoid judgement and give others space to share their experiences safely.',
      emoji: '💙',
    },
  ];

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Find Your Community
        </Text>

        <Pressable
          style={styles.createButton}
          onPress={onCreateGroup}
        >
          <Text style={styles.createButtonText}>
            + Create
          </Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Connect with people who understand
      </Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search groups..."
        placeholderTextColor="#8A94A6"
      />

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <Text
          style={[
            styles.categoryTab,
            styles.activeCategory,
          ]}
        >
          All
        </Text>

        <Text style={styles.categoryTab}>
          Stress & Anxiety
        </Text>

        <Text style={styles.categoryTab}>
          Academic Pressure
        </Text>

        <Text style={styles.categoryTab}>
          Depression
        </Text>

        <Text style={styles.categoryTab}>
          Self-Care
        </Text>
      </ScrollView>

      {/* Communities */}
      <ScrollView
        style={styles.groupsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.groupsContainer}
      >

        {/* ================= MY COMMUNITIES ================= */}

        {joinedGroups.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              MY COMMUNITIES
            </Text>

            <View style={styles.myCommunitiesGrid}>
              {joinedGroups.map(group => (
                <View
                  key={group.groupName}
                  style={styles.myCommunityCard}
                >

                  {/* Emoji */}
                  <View style={styles.smallGroupImage}>
                    <Text
                      style={styles.smallGroupImageText}
                    >
                      {group.emoji}
                    </Text>
                  </View>

                  {/* Category */}
                  <Text
                    style={styles.myCommunityCategory}
                    numberOfLines={1}
                  >
                    {group.category.toUpperCase()}
                  </Text>

                  {/* Group Name */}
                  <Text
                    style={styles.myCommunityTitle}
                    numberOfLines={2}
                  >
                    {group.groupName}
                  </Text>

                  {/* Buttons */}
                  <View style={styles.myCommunityBottom}>

                    {/* FIXED: Open is now clickable */}
                    <Pressable
                      style={styles.smallOpenButton}
                      onPress={() =>
                        onOpenGroup(group)
                      }
                    >
                      <Text
                        style={styles.smallOpenButtonText}
                      >
                        Open
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.smallLeaveButton}
                      onPress={() =>
                        onLeaveGroup(
                          group.groupName
                        )
                      }
                    >
                      <Text
                        style={
                          styles.smallLeaveButtonText
                        }
                      >
                        Leave
                      </Text>
                    </Pressable>

                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ================= ALL COMMUNITIES ================= */}

        <Text style={styles.sectionTitle}>
          ALL COMMUNITIES
        </Text>

        {allGroups.map(group => {
          const isMember = joinedGroups.some(
            joinedGroup =>
              joinedGroup.groupName ===
              group.groupName
          );

          return (
            <View
              key={group.groupName}
              style={styles.groupCard}
            >
              <View style={styles.groupTop}>

                <View style={styles.groupImage}>
                  <Text
                    style={styles.groupImageText}
                  >
                    {group.emoji}
                  </Text>
                </View>

                <View style={styles.groupInfo}>
                  <Text style={styles.groupCategory}>
                    {group.category.toUpperCase()}
                  </Text>

                  <Text style={styles.groupTitle}>
                    {group.groupName}
                  </Text>
                </View>

              </View>

              <Text style={styles.groupDescription}>
                {group.description}
              </Text>

              <View style={styles.groupBottom}>

                {isMember ? (
                  <Pressable
                    style={styles.openGroupButton}
                    onPress={() =>
                      onOpenGroup(group)
                    }
                  >
                    <Text
                      style={
                        styles.openGroupButtonText
                      }
                    >
                      Open
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.joinButton}
                    onPress={() =>
                      onOpenGroup(group)
                    }
                  >
                    <Text style={styles.joinButtonText}>
                      Join
                    </Text>
                  </Pressable>
                )}

              </View>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 10,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 8,
    color: '#667085',
    marginHorizontal: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
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
    marginTop: 24,
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
  },

  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
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
    marginTop: 4,
  },

  groupsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#667085',
    letterSpacing: 0.5,
  },

  /* ================= MY COMMUNITIES ================= */

  myCommunitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  myCommunityCard: {
    width: '48%',
    backgroundColor: '#ddf3e7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },

  smallGroupImage: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  smallGroupImageText: {
    fontSize: 24,
  },

  myCommunityCategory: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2673FF',
    marginBottom: 3,
  },

  myCommunityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 17,
    minHeight: 34,
  },

  myCommunityBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: 6,
  },

  smallOpenButton: {
    backgroundColor: '#d0d9eb',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 9,
  },

  smallOpenButtonText: {
    color: '#2673FF',
    fontSize: 13,
    fontWeight: '700',
  },

  smallLeaveButton: {
    backgroundColor: '#f0c4c4',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 9,
  },

  smallLeaveButtonText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ================= ALL COMMUNITIES ================= */

  groupCard: {
    backgroundColor: '#e0e8f7',
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
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  groupImageText: {
    fontSize: 24,
  },

  groupInfo: {
    flex: 1,
  },

  groupCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2673FF',
    marginBottom: 4,
  },

  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  groupDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#667085',
    marginTop: 12,
  },

  groupBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },

  joinButton: {
    backgroundColor: '#2673FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },

  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  memberBadge: {
    backgroundColor: '#E8F7EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  memberBadgeText: {
    color: '#2E9B57',
    fontSize: 12,
    fontWeight: '700',
  },

  openGroupButton: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  openGroupButtonText: {
    color: '#2673FF',
    fontSize: 12,
    fontWeight: '700',
  },

  leaveButton: {
    backgroundColor: '#FFF1F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  leaveButtonText: {
    color: '#D64545',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default GroupsHomeScreen;
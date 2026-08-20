import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';

const GroupsHomeScreen = () => {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
  <Text style={styles.title}>Find Your Community</Text>

  <Pressable style={styles.createButton}>
    <Text style={styles.createButtonText}>+ Create</Text>
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
        <Text style={[styles.categoryTab, styles.activeCategory]}>
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

      {/* All Communities + Group Cards */}
      <ScrollView
        style={styles.groupsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.groupsContainer}
      >

        <Text style={styles.sectionTitle}>
          ALL COMMUNITIES
        </Text>

        {/* Group 1 */}
        <View style={styles.groupCard}>
          <View style={styles.groupTop}>

            <View style={styles.groupImage}>
              <Text style={styles.groupImageText}>📚</Text>
            </View>

            <View style={styles.groupInfo}>
              <Text style={styles.groupCategory}>
                ACADEMIC PRESSURE
              </Text>

              <Text style={styles.groupTitle}>
                Managing Academic Stress
              </Text>
            </View>

          </View>

          <Text style={styles.groupDescription}>
            A supportive space to share experiences and learn ways
            to manage academic pressure.
          </Text>

          <View style={styles.groupBottom}>

        

            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>
                Join
              </Text>
            </Pressable>

          </View>
        </View>

        {/* Group 2 */}
        <View style={styles.groupCard}>
          <View style={styles.groupTop}>

            <View style={styles.groupImage}>
              <Text style={styles.groupImageText}>🧘</Text>
            </View>

            <View style={styles.groupInfo}>
              <Text style={styles.groupCategory}>
                STRESS & ANXIETY
              </Text>

              <Text style={styles.groupTitle}>
                Calm Minds Community
              </Text>
            </View>

          </View>

          <Text style={styles.groupDescription}>
            A safe community to share feelings, coping strategies,
            and everyday experiences.
          </Text>

          <View style={styles.groupBottom}>

           

            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>
                Join
              </Text>
            </Pressable>

          </View>
        </View>

        {/* Group 3 */}
        <View style={styles.groupCard}>
          <View style={styles.groupTop}>

            <View style={styles.groupImage}>
              <Text style={styles.groupImageText}>🌿</Text>
            </View>

            <View style={styles.groupInfo}>
              <Text style={styles.groupCategory}>
                SELF-CARE
              </Text>

              <Text style={styles.groupTitle}>
                Mindfulness & Self-Care
              </Text>
            </View>

          </View>

          <Text style={styles.groupDescription}>
            Discover simple self-care habits and mindfulness
            practices together with others.
          </Text>

          <View style={styles.groupBottom}>

            

            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>
                Join
              </Text>
            </Pressable>

          </View>
        </View>

        {/* Group 4 */}
        <View style={styles.groupCard}>
          <View style={styles.groupTop}>

            <View style={styles.groupImage}>
              <Text style={styles.groupImageText}>💙</Text>
            </View>

            <View style={styles.groupInfo}>
              <Text style={styles.groupCategory}>
                DEPRESSION SUPPORT
              </Text>

              <Text style={styles.groupTitle}>
                You Are Not Alone
              </Text>
            </View>

          </View>

          <Text style={styles.groupDescription}>
            A welcoming space for people to connect, listen,
            and support one another.
          </Text>

          <View style={styles.groupBottom}>

         

            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>
                Join
              </Text>
            </Pressable>

          </View>
        </View>

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

});

export default GroupsHomeScreen;
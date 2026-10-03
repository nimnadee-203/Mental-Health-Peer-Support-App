import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TabName = 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Activities';

type BottomNavigationProps = {
  activeTab: TabName;
  onChangeTab: (tab: TabName) => void;
};

const navItems: Array<{ label: TabName }> = [
  { label: 'Home' },
  { label: 'Resources' },
  { label: 'Groups' },
  { label: 'Messages' },
  { label: 'Activities' },
];

function NavIcon({ tab, isActive }: { tab: TabName; isActive: boolean }) {
  const color = isActive ? '#2673FF' : '#7D8795';

  if (tab === 'Home') {
    return (
      <View style={iconStyles.box}>
        <View style={[iconStyles.roof, { borderBottomColor: color }]} />
        <View style={[iconStyles.houseBody, { backgroundColor: color }]}>
          <View style={iconStyles.door} />
        </View>
      </View>
    );
  }

  if (tab === 'Resources') {
    return (
      <View style={iconStyles.box}>
        <View style={[iconStyles.bookCard, { borderColor: color }]}>
          <View style={[iconStyles.bookLine, { backgroundColor: color }]} />
          <View style={[iconStyles.bookLineShort, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (tab === 'Groups') {
    return (
      <View style={iconStyles.box}>
        <View style={[iconStyles.sideHead, { backgroundColor: color, opacity: 0.65 }]} />
        <View style={[iconStyles.sideBody, { backgroundColor: color, opacity: 0.65 }]} />
        <View style={[iconStyles.mainHead, { backgroundColor: color }]} />
        <View style={[iconStyles.mainBody, { backgroundColor: color }]} />
      </View>
    );
  }

  if (tab === 'Messages') {
    return (
      <View style={iconStyles.box}>
        <View style={[iconStyles.chatBubble, { backgroundColor: color }]}>
          <View style={[iconStyles.chatTail, { borderTopColor: color }]} />
          <View style={iconStyles.dotsRow}>
            <View style={iconStyles.dot} />
            <View style={iconStyles.dot} />
            <View style={iconStyles.dot} />
          </View>
        </View>
      </View>
    );
  }

  // Activities
  return (
    <View style={iconStyles.box}>
      <View style={[iconStyles.activityCircle, { borderColor: color }]}>
        <View style={[iconStyles.activityCenter, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BottomNavigation({ activeTab, onChangeTab }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map(item => {
          const isActive = item.label === activeTab;

          return (
            <Pressable
              key={item.label}
              testID={`nav-${item.label}`}
              onPress={() => onChangeTab(item.label)}
              style={[styles.navItem, isActive && styles.navItemActive]}>
              <NavIcon tab={item.label} isActive={isActive} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  box: {
    width: 24,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#7D8795',
  },
  houseBody: {
    width: 13,
    height: 10,
    backgroundColor: '#7D8795',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  door: {
    width: 4,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  bookCard: {
    width: 16,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#7D8795',
    paddingTop: 3,
    paddingHorizontal: 2,
    alignItems: 'flex-start',
    gap: 2,
  },
  bookLine: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#7D8795',
  },
  bookLineShort: {
    width: 5,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#7D8795',
  },
  mainHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    position: 'absolute',
    top: 1,
    left: 9,
  },
  mainBody: {
    width: 12,
    height: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    position: 'absolute',
    top: 10,
    left: 6.5,
  },
  sideHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 2,
    left: 3,
  },
  sideBody: {
    width: 9,
    height: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 10,
    left: 1.5,
  },
  chatBubble: {
    width: 18,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#7D8795',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatTail: {
    position: 'absolute',
    bottom: -4,
    left: 3,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 2,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7D8795',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
  },
  activityCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#7D8795',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7D8795',
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#EBF3FF',
  },
  navLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#7D8795',
  },
  navLabelActive: {
    color: '#2673FF',
  },
});

export default BottomNavigation;


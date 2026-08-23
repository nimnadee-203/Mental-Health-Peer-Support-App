import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TabName = 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile';

type BottomNavigationProps = {
  activeTab: TabName;
  onChangeTab: (tab: TabName) => void;
};

const navItems: Array<{ label: TabName; icon: string }> = [
  { label: 'Home', icon: '⌂' },
  { label: 'Resources', icon: '✦' },
  { label: 'Groups', icon: '◎' },
  { label: 'Messages', icon: '✉' },
  { label: 'Profile', icon: '◌' },
];

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
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
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
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#EBF3FF',
  },
  navIcon: {
    fontSize: 16,
    color: '#7D8795',
  },
  navIconActive: {
    color: '#2673FF',
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

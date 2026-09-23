import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type TabName = 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Activities';

type BottomNavigationProps = {
  activeTab: TabName;
  onChangeTab: (tab: TabName) => void;
  /** Total unread message count — shows a badge dot on the Messages tab */
  unreadMessages?: number;
};

const navItems: Array<{ label: TabName; icon: keyof typeof Feather.glyphMap; activeIcon: keyof typeof Feather.glyphMap }> = [
  { label: 'Home',       icon: 'home', activeIcon: 'home' },
  { label: 'Resources',  icon: 'compass', activeIcon: 'compass' },
  { label: 'Groups',     icon: 'users', activeIcon: 'users' },
  { label: 'Messages',   icon: 'message-circle', activeIcon: 'message-circle' },
  { label: 'Activities', icon: 'activity', activeIcon: 'activity' },
];

// ─── Single Nav Tab ───────────────────────────────────────────────────────────
interface NavTabProps {
  item: { label: TabName; icon: keyof typeof Feather.glyphMap; activeIcon: keyof typeof Feather.glyphMap };
  isActive: boolean;
  onPress: () => void;
  badgeCount?: number;
}

function NavTab({ item, isActive, onPress, badgeCount }: NavTabProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
    }).start();
  };

  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <Pressable
      testID={`nav-${item.label}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${item.label}${showBadge ? `, ${badgeCount} unread` : ''}`}
      style={styles.navItem}>
      <Animated.View
        style={[
          styles.iconWrapper,
          isActive && styles.iconWrapperActive,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {/* Icon */}
        <View style={styles.iconArea}>
          <Feather
            name={isActive ? item.activeIcon : item.icon}
            size={22}
            color={isActive ? '#FFFFFF' : '#A0A0B8'}
          />

          {/* Unread badge */}
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount! > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── BottomNavigation ─────────────────────────────────────────────────────────
function BottomNavigation({
  activeTab,
  onChangeTab,
  unreadMessages = 0,
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map(item => (
          <NavTab
            key={item.label}
            item={item}
            isActive={item.label === activeTab}
            onPress={() => onChangeTab(item.label)}
            badgeCount={item.label === 'Messages' ? unreadMessages : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#0D0D1A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#ECEEF8',
  },

  // ── Tab ───────────────────────────────────────────────────────────────────
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24,
    minWidth: 54,
  },
  iconWrapperActive: {
    backgroundColor: '#5A5AD8',
    shadowColor: '#5A5AD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Icon + badge ──────────────────────────────────────────────────────────
  iconArea: {
    position: 'relative',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Unread badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 12,
  },

  // ── Label ─────────────────────────────────────────────────────────────────
  navLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#A0A0B8',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default BottomNavigation;

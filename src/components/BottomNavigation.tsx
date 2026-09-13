import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type TabName = 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile';

type BottomNavigationProps = {
  activeTab: TabName;
  onChangeTab: (tab: TabName) => void;
  /** Total unread message count — shows a badge dot on the Messages tab */
  unreadMessages?: number;
};

const navItems: Array<{ label: TabName; icon: string; activeIcon: string }> = [
  { label: 'Home',      icon: '⌂',  activeIcon: '⌂'  },
  { label: 'Resources', icon: '✦',  activeIcon: '✦'  },
  { label: 'Groups',    icon: '◎',  activeIcon: '◎'  },
  { label: 'Messages',  icon: '✉',  activeIcon: '✉'  },
  { label: 'Profile',   icon: '◌',  activeIcon: '◌'  },
];

// ─── Single Nav Tab ───────────────────────────────────────────────────────────
interface NavTabProps {
  item: { label: TabName; icon: string; activeIcon: string };
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
          <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
            {isActive ? item.activeIcon : item.icon}
          </Text>

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
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 52,
  },
  iconWrapperActive: {
    backgroundColor: '#EBF3FF',
  },

  // ── Icon + badge ──────────────────────────────────────────────────────────
  iconArea: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 17,
    color: '#9EA6B4',
    lineHeight: 24,
  },
  navIconActive: {
    color: '#2673FF',
  },

  // Unread badge
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
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
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: '#9EA6B4',
  },
  navLabelActive: {
    color: '#2673FF',
    fontWeight: '700',
  },
});

export default BottomNavigation;

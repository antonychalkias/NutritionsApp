import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: 20,
  },
  logo: { width: 160, height: 160 },
  indicator: {},
  text: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.primaryForeground,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    fontSize: 15,
    letterSpacing: 0.4,
  },
});

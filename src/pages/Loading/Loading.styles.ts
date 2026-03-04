import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  logo: { width: 120, height: 120, marginBottom: 32 },
  indicator: { marginBottom: 16 },
  text: { fontSize: 18, color: COLORS.cardForeground, fontWeight: '500' },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
  },
});

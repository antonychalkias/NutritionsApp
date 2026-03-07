import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export type AppInputSize = 'small' | 'large' | 'xlarge';

export const INPUT_SIZES: Record<AppInputSize, any> = {
  small: {
    height: 36,
    width: '100%',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  large: {
    height: 44,
    fontSize: 16,
    width: '100%',
    paddingHorizontal: 12,
  },
  xlarge: {
    height: 56,
    fontSize: 18,
    width: '100%',
    paddingHorizontal: 16,
  },
};

export const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    color: COLORS.cardForeground,
    fontFamily: 'Inter',
    marginBottom: 0,
  },
});


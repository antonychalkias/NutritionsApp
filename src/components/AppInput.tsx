import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '@/constants/theme';

export type AppInputSize = 'small' | 'large' | 'xl';

const INPUT_SIZES: Record<AppInputSize, any> = {
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
  xl: {
    height: 56,
    fontSize: 18,
    width: '100%',
    paddingHorizontal: 16,
  },
};

interface AppInputProps extends TextInputProps {
  size?: AppInputSize;
  style?: any;
}

const AppInput: React.FC<AppInputProps> = ({ size = 'xl', style, ...props }) => (
  <TextInput
    style={[styles.input, INPUT_SIZES[size], style]}
    placeholderTextColor={COLORS.mutedForeground}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    color: COLORS.cardForeground,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
});

export default AppInput;

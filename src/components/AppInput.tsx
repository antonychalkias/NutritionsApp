import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { COLORS } from '@/constants/theme';
import { INPUT_SIZES, styles, AppInputSize } from './AppInput.styles';

interface AppInputProps extends TextInputProps {
  size?: AppInputSize;
  style?: any;
}

const AppInput: React.FC<AppInputProps> = ({ size = 'xlarge', style, ...props }) => (
  <TextInput
    style={[styles.input, INPUT_SIZES[size], style]}
    placeholderTextColor={COLORS.mutedForeground}
    {...props}
  />
);

export default AppInput;

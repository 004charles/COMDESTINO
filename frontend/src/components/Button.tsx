import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}) => {
  const bg =
    variant === 'primary' ? colors.green : variant === 'gold' ? colors.gold : 'transparent';
  const textColor = variant === 'gold' ? colors.black : colors.white;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === 'outline' && styles.outline,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: variant === 'outline' ? colors.green : textColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});

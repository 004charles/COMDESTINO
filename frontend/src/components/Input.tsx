import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

type Props = TextInputProps & {
  label?: string;
  containerStyle?: ViewStyle;
};

export const Input: React.FC<Props> = ({ label, containerStyle, style, ...rest }) => (
  <View style={[{ marginBottom: 14 }, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={colors.gray400}
      style={[styles.input, style]}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.gray900,
  },
});

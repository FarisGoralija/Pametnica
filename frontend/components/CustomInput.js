import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry = false,
  keyboardType = 'default',
  error = false,
  isPassword = false,        // 👈 NEW
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View
      style={[
        styles.container,
        error && styles.errorContainer,
      ]}
    >
      {/* LEFT ICON */}
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={24}
          color={error ? '#E53935' : styles.placeholder.color}
          style={styles.icon}
        />
      )}

      {/* INPUT */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        placeholderTextColor={styles.placeholder.color}
      />

      {/* EYE ICON (RIGHT SIDE) */}
      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsSecure(!isSecure)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={error ? '#E53935' : '#7D7D7D'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 44,
    backgroundColor: '#C0EAF0',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginVertical: 10,
  },

  errorContainer: {
    borderWidth: 1.5,
    borderColor: '#E53935',
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'SFCompactRounded-Bold',
    color: '#7D7D7D',
  },

  placeholder: {
    color: '#AFAFAF',
  },
});

export default CustomInput;

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LIST_TYPE_NORMAL = 1; // UI value
const LIST_TYPE_EMERGENCY = 2; // UI value

const AddListModal = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const startList = (listType) => {
    onClose?.();
    navigation.navigate("Liste", {
      screen: "NewListScreen",
      params: {
        listId: null,
        listTitle: listType === LIST_TYPE_EMERGENCY ? "Hitna lista" : "Nova lista",
        listType,
      },
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* BACKDROP */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.full} onPress={onClose} />
      </Animated.View>

      {/* PANEL */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ActionButton
          icon="plus"
          label="Nova lista"
          color="#3793F0"
          onPress={() => startList(LIST_TYPE_NORMAL)}
        />

        <ActionButton
          icon="alert-circle"
          label="Hitna lista"
          color="#FF6B6B"
          onPress={() => startList(LIST_TYPE_EMERGENCY)}
        />

        <ActionButton
          icon="close"
          label="Izađi"
          color="#777"
          onPress={onClose}
        />
      </Animated.View>
    </Modal>
  );
};

const ActionButton = ({ icon, label, onPress, color }) => (
  <TouchableOpacity
    style={styles.action}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.iconWrap, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={26} color="#fff" />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  full: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    bottom: 30,
    left: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 24,
    elevation: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  actionText: {
    fontSize: 17,
    fontWeight: "700",
  },
});

export default AddListModal;

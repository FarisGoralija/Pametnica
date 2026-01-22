import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ListsCard = ({
  title,
  emptyText,
  buttonText,
  onCreatePress,
  backgroundColor,
  icon,
  lists = [],
  onCardPress,
  renderExtraAction,
  cardHeight = 300,
  listMaxHeight = 190,
  centerEmpty = false,
}) => {
  return (
    <View style={[styles.card, { backgroundColor, height: cardHeight }]}>
      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* CONTENT */}
      <View style={styles.center}>
        {lists.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              centerEmpty && styles.emptyContainerCentered,
            ]}
          >
            {icon}

            <Text style={styles.empty}>{emptyText}</Text>

            {buttonText && onCreatePress && (
              <TouchableOpacity style={styles.button} onPress={onCreatePress}>
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.listContainer, { maxHeight: listMaxHeight }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              {lists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listItem,
                    (list.type === 1 || list.type === "emergency") &&
                      styles.listItemEmergency,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => onCardPress && onCardPress(list)}
                >
                  {/* LEFT ICON */}
                  <View
                    style={[
                      styles.iconBox,
                      (list.type === 1 || list.type === "emergency") &&
                        styles.iconBoxEmergency,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cart-outline"
                      size={26}
                      color="#FFFFFF"
                    />
                  </View>

                  {/* TEXT */}
                  <View style={styles.textWrapper}>
                    <Text style={styles.listItemTitle}>{list.title}</Text>
                    <Text style={styles.listItemSubtitle}>
                      {list.createdAt
                        ? new Date(list.createdAt).toLocaleDateString()
                        : "Today"}
                    </Text>
                  </View>

                  {/* EXTRA ACTION (optional) */}
                  {renderExtraAction ? (
                    renderExtraAction(list)
                  ) : (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={28}
                      color="#4A4A4A"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    height: 300, // enough for title + 3 items
    position: "relative",
    elevation: 3,
  },

  title: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
  },

  emptyContainerCentered: {
    flex: 1,
    justifyContent: "center",
  },

  center: {
    flex: 1,
    paddingTop: 70, // space for title
  },

  /* EMPTY STATE */
  empty: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.85,
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  button: {
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  buttonText: {
    fontWeight: "600",
    color: "#000",
  },

  /* LIST AREA (LIMIT HEIGHT → SCROLL AFTER 3 ITEMS) */
  listContainer: {
    maxHeight: 190, // ≈ 3 items
  },

  /* LIST ITEM */
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    elevation: 2,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconBoxEmergency: {
    backgroundColor: "#E53935",
  },

  textWrapper: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  listItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  listItemEmergency: {
    borderColor: "transparent",
    borderWidth: 0,
  },
});

export default ListsCard;

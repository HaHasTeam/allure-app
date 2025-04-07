import { myTheme } from "@/constants";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

interface TriggerListProps {
  simplifiedTriggers: any[];
  renderItem: any;
}
const TriggerList = ({ simplifiedTriggers, renderItem }: TriggerListProps) => {
  //   const renderItem = ({ item }) => (
  //     <TouchableOpacity
  //       style={[
  //         styles.triggerButton,
  //         activeTab === item.value && styles.activeTrigger
  //       ]}
  //       onPress={() => setActiveTab(item.value)}
  //     >
  //       <Text
  //         style={[
  //           styles.triggerText,
  //           activeTab === item.value && styles.activeText
  //         ]}
  //       >
  //         {item.text}
  //       </Text>
  //     </TouchableOpacity>
  //   );

  return (
    <View style={styles.container}>
      <FlatList
        data={simplifiedTriggers}
        renderItem={renderItem}
        keyExtractor={(item) => item.value}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  triggerButton: {
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 16,
  },
  activeTrigger: {
    borderBottomColor: myTheme.primary,
  },
  triggerText: {
    fontSize: 16,
    color: "#666666",
  },
  activeText: {
    color: myTheme.primary,
    fontWeight: "600",
  },
});

export default TriggerList;

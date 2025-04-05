import { useState } from "react";
import { useTranslation } from "react-i18next";

import { OrderRequestTypeEnum, RequestStatusEnum } from "@/types/enum";
import { myTheme } from "@/constants";
import { Picker } from "react-native-ui-lib";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MyText from "../common/MyText";
import { Feather } from "@expo/vector-icons";
import { hexToRgba } from "@/utils/color";

interface FilterProps {
  onFilterChange: (
    typeFilters: OrderRequestTypeEnum[],
    statusFilters: RequestStatusEnum[]
  ) => void;
}

interface IOrderRequestItem {
  type?: string;
  label?: string;
  value: OrderRequestTypeEnum;
}
interface IRequestItem {
  type?: string;
  label?: string;
  value: RequestStatusEnum;
}
export const OrderRequestFilter = ({ onFilterChange }: FilterProps) => {
  const { t } = useTranslation();
  const [typeFilters, setTypeFilters] = useState<OrderRequestTypeEnum[]>([]);
  const [statusFilters, setStatusFilters] = useState<RequestStatusEnum[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const requestTypes = [
    { value: OrderRequestTypeEnum.CANCEL, label: t("requestTypes.cancel") },
    { value: OrderRequestTypeEnum.REFUND, label: t("requestTypes.return") },
    {
      value: OrderRequestTypeEnum.REJECT_REFUND,
      label: t("requestTypes.rejectReturn"),
    },
    {
      value: OrderRequestTypeEnum.COMPLAINT,
      label: t("requestTypes.complaint"),
    },
  ];

  const requestStatuses = [
    { value: RequestStatusEnum.PENDING, label: t("requestStatus.pending") },
    { value: RequestStatusEnum.APPROVED, label: t("requestStatus.approved") },
    { value: RequestStatusEnum.REJECTED, label: t("requestStatus.rejected") },
  ];

  const toggleType = (value: OrderRequestTypeEnum) => {
    const newValues = typeFilters.includes(value)
      ? typeFilters.filter((item) => item !== value)
      : [...typeFilters, value];

    setTypeFilters(newValues);
    onFilterChange(newValues, statusFilters);
  };

  const toggleStatus = (value: RequestStatusEnum) => {
    const newValues = statusFilters.includes(value)
      ? statusFilters.filter((item) => item !== value)
      : [...statusFilters, value];

    setStatusFilters(newValues);
    onFilterChange(typeFilters, newValues);
  };

  const clearFilters = () => {
    setTypeFilters([]);
    setStatusFilters([]);
    onFilterChange([], []);
  };
  // Render badge item for filter chip
  const renderBadge = (
    filter: OrderRequestTypeEnum | RequestStatusEnum,
    collection: {
      value: OrderRequestTypeEnum | RequestStatusEnum;
      label: string;
    }[],
    toggleFn: (value: any) => void,
    bgColor: string,
    textColor: string
  ) => {
    const item = collection.find((item) => item.value === filter);

    return (
      <TouchableOpacity
        key={filter}
        style={[styles.badge, { backgroundColor: bgColor }]}
        onPress={() => toggleFn(filter)}
      >
        <View style={styles.badgeContent}>
          <MyText text={item?.label || ""} styleProps={{ color: textColor }} />
          <MyText
            text="×"
            styleProps={{ fontSize: 18, color: textColor, marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypeItem = (item: IOrderRequestItem) => (
    <Picker.Item
      key={item.value}
      value={item.value}
      label={item?.label ?? ""}
      renderItem={(selected) => (
        <View style={styles.pickerItem}>
          {selected && (
            <Feather name="check" size={16} style={styles.checkIcon} />
          )}
          <Text>{item.label ?? ""}</Text>
        </View>
      )}
    />
  );

  const renderStatusItem = (item: IRequestItem) => (
    <Picker.Item
      key={item.value}
      value={item.value}
      label={item.label ?? ""}
      renderItem={(selected) => (
        <View style={styles.pickerItem}>
          {selected && (
            <Feather name="check" size={16} style={styles.checkIcon} />
          )}
          <Text>{item.label}</Text>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      {/* Show active filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={[
            ...typeFilters.map((f) => ({
              id: `type-${f}`,
              type: "type",
              value: f,
            })),
            ...statusFilters.map((f) => ({
              id: `status-${f}`,
              type: "status",
              value: f,
            })),
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.type === "type"
              ? renderBadge(
                  item.value,
                  requestTypes,
                  toggleType,
                  myTheme.purple[100],
                  myTheme.purple[600]
                )
              : renderBadge(
                  item.value,
                  requestStatuses,
                  toggleStatus,
                  myTheme.orange[100],
                  myTheme.orange[600]
                )
          }
          ListFooterComponent={() =>
            typeFilters.length > 0 || statusFilters.length > 0 ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <MyText
                  text={t("request.clearAll")}
                  styleProps={{ color: myTheme.destructive[80] }}
                />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {/* Request Type Filter */}
      <View style={styles.filterSection}>
        <Picker
          value={typeFilters}
          placeholder={
            typeFilters.length > 0
              ? `${t("request.typeSelected")}: ${typeFilters.length}`
              : t("request.selectType")
          }
          onChange={(value) => toggleType(value)}
          showSearch
          searchPlaceholder={t("request.searchType")}
          searchStyle={styles.searchInput}
          containerStyle={styles.pickerContainer}
        >
          {requestTypes.map((item) => renderTypeItem(item))}
        </Picker>
      </View>

      {/* Request Status Filter */}
      <View style={styles.filterSection}>
        <Picker
          value={statusFilters}
          placeholder={
            statusFilters.length > 0
              ? `${t("request.statusSelected")}: ${statusFilters.length}`
              : t("request.selectStatus")
          }
          onChange={(value) => toggleStatus(value)}
          showSearch
          searchPlaceholder={t("request.searchStatus")}
          searchStyle={styles.searchInput}
          containerStyle={styles.pickerContainer}
        >
          {requestStatuses.map((item) => renderStatusItem(item))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: "center",
    marginLeft: 4,
  },
  filterSection: {
    width: "100%",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: hexToRgba(myTheme.primary, 0.4),
    borderRadius: 4,
    height: 40,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: myTheme.primary,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checkIcon: {
    marginRight: 8,
    color: myTheme.primary,
  },
});

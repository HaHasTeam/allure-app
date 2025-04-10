import { useState } from "react";
import { useTranslation } from "react-i18next";

import { OrderRequestTypeEnum, RequestStatusEnum } from "@/types/enum";
import { myTextColor, myTheme } from "@/constants";
import { Picker, PickerValue } from "react-native-ui-lib";
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
  onFilterChange: (typeFilters: any, statusFilters: any) => void;
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
  const [typeFilters, setTypeFilters] = useState<any>([]);
  const [statusFilters, setStatusFilters] = useState<any>([]);
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

  const toggleType = (value: PickerValue) => {
    // const newValues = typeFilters.includes(value)
    //   ? typeFilters.filter((item) => item !== value)
    //   : [...typeFilters, value];

    setTypeFilters(value);
    onFilterChange(value, statusFilters);
  };

  const toggleStatus = (value: PickerValue) => {
    // const newValues = statusFilters.includes(value)
    //   ? statusFilters.filter((item) => item !== value)
    //   : [...statusFilters, value];

    setStatusFilters(value);
    onFilterChange(typeFilters, value);
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
          <MyText
            text={item?.label || ""}
            styleProps={{ fontSize: 12, color: textColor }}
          />
          <MyText
            text="×"
            styleProps={{ fontSize: 12, color: textColor, marginLeft: 4 }}
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

  const renderTypePickerValue = () => {
    return (
      <Text style={styles.pickerText}>
        {typeFilters.length > 0
          ? `${t("request.typeSelected")}: ${typeFilters.length}`
          : t("request.selectType")}
      </Text>
    );
  };

  const renderStatusPickerValue = () => {
    return (
      <Text style={styles.pickerText}>
        {statusFilters.length > 0
          ? `${t("request.statusSelected")}: ${statusFilters.length}`
          : t("request.selectStatus")}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Request Type Filter */}
      <View style={styles.filterSectionContainer}>
        <View style={styles.filterSection}>
          <Picker
            value={typeFilters}
            placeholder={
              typeFilters.length > 0
                ? `${t("request.typeSelected")}: ${typeFilters.length}`
                : t("request.selectType")
            }
            onChange={toggleType}
            showSearch
            searchPlaceholder={t("request.searchType")}
            containerStyle={styles.pickerContainer}
            color={myTheme.primary}
            centered
            enableModalBlur={false}
            topBarProps={{ title: t("picker.filters") }}
            mode={Picker.modes.MULTI}
            items={requestTypes}
            renderInput={renderTypePickerValue}
          />
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
            containerStyle={styles.pickerContainer}
            enableModalBlur={false}
            topBarProps={{ title: t("picker.filters") }}
            mode={Picker.modes.MULTI}
            items={requestStatuses}
            color={myTheme.primary}
            centered
            renderInput={renderStatusPickerValue}
          />
        </View>
      </View>
      {/* Show active filters */}
      {(typeFilters.length > 0 || statusFilters.length > 0) && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={[
              ...typeFilters.map((f: OrderRequestTypeEnum) => ({
                id: `type-${f}`,
                type: "type",
                value: f,
              })),
              ...statusFilters.map((f: RequestStatusEnum) => ({
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
                    text={t("filter.reset")}
                    styleProps={{ color: myTheme.gray[500] }}
                  />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerText: {
    color: myTheme.primary,
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 12,
  },
  filterSectionContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  container: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    width: "auto",
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: hexToRgba(myTheme.primary, 0.4),
    borderRadius: 4,
    padding: 8,
    color: myTheme.primary,
    fontWeight: "semibold",
    width: "100%",
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

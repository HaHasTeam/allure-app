import { myTheme } from "@/constants";
import { RequestStatusEnum } from "@/types/enum";
import { StyleSheet } from "react-native";

export const getRequestStatusColor = (status: RequestStatusEnum) => {
  switch (status) {
    case RequestStatusEnum.PENDING:
      return styles.pending;
    case RequestStatusEnum.APPROVED:
      return styles.approved;
    case RequestStatusEnum.REJECTED:
      return styles.rejected;
    default:
      return styles.default;
  }
};

const styles = StyleSheet.create({
  pending: {
    backgroundColor: myTheme.yellow[100],
    color: myTheme.yellow[600],
  },
  approved: {
    backgroundColor: myTheme.green[100],
    color: myTheme.green[600],
  },
  rejected: {
    backgroundColor: myTheme.red[100],
    color: myTheme.red[600],
  },
  default: {
    backgroundColor: myTheme.gray[100],
    color: myTheme.gray[600],
  },
});

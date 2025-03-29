import { myTheme } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, RelativePathString } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConsultationCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  linkTo: string;
}
const ConsultationCard: React.FC<ConsultationCardProps> = ({
  title,
  description,
  icon,
  linkTo,
}) => {
  return (
    <Link href={linkTo as RelativePathString} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon} size={24} color={myTheme.orange[400]} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={myTheme.gray[500]}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default ConsultationCard;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: myTheme.primary,
  },
  cardContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: myTheme.orange[100],
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: myTheme.gray[500],
  },
});

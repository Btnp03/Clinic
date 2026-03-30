import { View, Text, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { styles } from "./doctors.styles";

type DoctorsHeaderProps = {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onToggleSort: () => void;
};

const DoctorsHeader = ({ title, search, onSearchChange, onBack, onToggleSort }: DoctorsHeaderProps) => {
  return (
    <LinearGradient
      colors={["#052659", "#5483B3", "#7DA0CA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerCurve} />
      <View style={styles.headerTop}>
        <Pressable style={styles.iconButton} onPress={onBack}>
          <FontAwesome name="chevron-left" size={14} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable style={styles.iconButton} onPress={onToggleSort}>
          <FontAwesome name="sliders" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <View style={styles.searchWrap}>
        <FontAwesome name="search" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Search doctors"
          placeholderTextColor="#9FB6D8"
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
        />
      </View>
    </LinearGradient>
  );
};

export default DoctorsHeader;

import { ScrollView, View, Text, Image, Pressable, ActivityIndicator } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DoctorUser } from "../../types/user";
import { styles } from "./doctors.styles";

type DoctorsListProps = {
  doctors: DoctorUser[];
  loading: boolean;
  onSelect: (doctorId: string) => void;
};

const DoctorsList = ({ doctors, loading, onSelect }: DoctorsListProps) => {
  return (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="small" color="#5483B3" />
          <Text style={styles.stateText}>Loading doctors...</Text>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No doctors found.</Text>
        </View>
      ) : (
        doctors.map((doctor) => (
          <Pressable key={doctor.id} style={styles.card} onPress={() => onSelect(doctor.id!)}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{doctor.name}</Text>
                <Text style={styles.cardRole}>{doctor.doctorTypeName || doctor.doctorType || "Aesthetic Specialist"}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <FontAwesome name="star" size={12} color="#F6C453" />
                    <Text style={styles.metaText}>
                      {doctor.rating ? doctor.rating.toFixed(1) : "No ratings yet"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <FontAwesome name="briefcase" size={12} color="#7DA0CA" />
                    <Text style={styles.metaText}>
                      {doctor.experience ? `${doctor.experience} years experience` : "Experience not listed"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <FontAwesome name="clock-o" size={12} color="#7DA0CA" />
                    <Text style={styles.metaText}>Available today</Text>
                  </View>
                </View>
              </View>
            <Image
              source={{
                uri:
                  doctor.photoUrl ||
                  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
              }}
              style={styles.cardAvatar}
            />
          </View>
        </Pressable>
      ))
    )}
    </ScrollView>
  );
};

export default DoctorsList;

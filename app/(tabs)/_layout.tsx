import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#052659",
        tabBarInactiveTintColor: "#9AA8C1",
        tabBarStyle: {
          borderTopColor: "#E3ECF9",
          backgroundColor: "white"
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ color, size }) => <FontAwesome name="stethoscope" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

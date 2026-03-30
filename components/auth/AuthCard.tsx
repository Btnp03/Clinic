import { View, Text, ViewStyle, TextStyle } from "react-native";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  cardStyle: ViewStyle;
  titleStyle: TextStyle;
  subtitleStyle: TextStyle;
};

const AuthCard = ({ title, subtitle, children, cardStyle, titleStyle, subtitleStyle }: AuthCardProps) => {
  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={subtitleStyle}>{subtitle}</Text>
      {children}
    </View>
  );
};

export default AuthCard;

import { ImageBackground, View, Text, ViewStyle, TextStyle, ImageStyle } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type AuthHeroProps = {
  title: string;
  subtitle: string;
  containerStyle: ViewStyle;
  imageContainerStyle: ViewStyle;
  imageStyle: ImageStyle;
  overlayStyle: ViewStyle;
  contentStyle: ViewStyle;
  brandRowStyle: ViewStyle;
  brandIconStyle: ViewStyle;
  brandTextStyle: TextStyle;
  titleStyle: TextStyle;
  subtitleStyle: TextStyle;
  imageUri: string;
  showContent?: boolean;
};

const AuthHero = ({
  title,
  subtitle,
  containerStyle,
  imageContainerStyle,
  imageStyle,
  overlayStyle,
  contentStyle,
  brandRowStyle,
  brandIconStyle,
  brandTextStyle,
  titleStyle,
  subtitleStyle,
  imageUri,
  showContent = true
}: AuthHeroProps) => {
  return (
    <View style={containerStyle}>
      <ImageBackground source={{ uri: imageUri }} style={imageContainerStyle} imageStyle={imageStyle}>
        <View style={overlayStyle} />
        {showContent ? (
          <View style={contentStyle}>
            <View style={brandRowStyle}>
              <View style={brandIconStyle}>
                <FontAwesome name="plus" size={14} color="#052659" />
              </View>
              <Text style={brandTextStyle}>ABB Aesthetic Clinic</Text>
            </View>
            <Text style={titleStyle}>{title}</Text>
            <Text style={subtitleStyle}>{subtitle}</Text>
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
};

export default AuthHero;

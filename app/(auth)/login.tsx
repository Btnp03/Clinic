import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AuthHero from "../../components/auth/AuthHero";
import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";
import { styles } from "../../components/auth/login.styles";

const LoginScreen = () => {
  return (
    <LinearGradient
      colors={["#052659", "#5483B3", "#7DA0CA"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.waveLayer}>
        <View style={styles.waveOne} />
        <View style={styles.waveOneA} />
        <View style={styles.waveOneB} />
        <View style={styles.waveTwo} />
        <View style={styles.waveTwoA} />
        <View style={styles.waveTwoB} />
        <View style={styles.waveThree} />
        <View style={styles.waveThreeA} />
        <View style={styles.waveThreeB} />
        <View style={styles.waveFour} />
        <View style={styles.waveFourA} />
        <View style={styles.waveFourB} />
        <View style={styles.waveFive} />
        <View style={styles.waveFiveA} />
        <View style={styles.waveFiveB} />
        <View style={styles.waveSix} />
        <View style={styles.waveSixA} />
        <View style={styles.waveSixB} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthHero
          title="Welcome Back"
          subtitle="Sign in to your ABB clinic account"
          containerStyle={styles.heroContainer}
          imageContainerStyle={styles.heroImageWrap}
          imageStyle={styles.heroImage}
          overlayStyle={styles.heroOverlay}
          contentStyle={styles.heroContent}
          brandRowStyle={styles.brandRow}
          brandIconStyle={styles.brandIcon}
          brandTextStyle={styles.brandText}
          titleStyle={styles.heroTitle}
          subtitleStyle={styles.heroSubtitle}
          imageUri="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80"
          showContent={false}
        />

        <AuthCard
          title="Welcome Back"
          subtitle="Sign in to your ABB clinic account"
          cardStyle={styles.formCard}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        >
          <LoginForm />
        </AuthCard>
      </ScrollView>
    </LinearGradient>
  );
};

export default LoginScreen;

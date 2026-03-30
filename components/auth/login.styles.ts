import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  waveLayer: {
    ...StyleSheet.absoluteFillObject
  },
  waveOne: {
    position: "absolute",
    width: 520,
    height: 260,
    borderRadius: 260,
    borderWidth: 3,
    borderColor: "rgba(125, 160, 202, 0.35)",
    top: 120,
    left: -180,
    transform: [{ rotate: "-8deg" }]
  },
  waveOneA: {
    position: "absolute",
    width: 500,
    height: 250,
    borderRadius: 250,
    borderWidth: 1.6,
    borderColor: "rgba(125, 160, 202, 0.28)",
    top: 128,
    left: -170,
    transform: [{ rotate: "-8deg" }]
  },
  waveOneB: {
    position: "absolute",
    width: 540,
    height: 270,
    borderRadius: 270,
    borderWidth: 3.4,
    borderColor: "rgba(125, 160, 202, 0.42)",
    top: 112,
    left: -190,
    transform: [{ rotate: "-8deg" }]
  },
  waveTwo: {
    position: "absolute",
    width: 580,
    height: 300,
    borderRadius: 290,
    borderWidth: 1.8,
    borderColor: "rgba(84, 131, 179, 0.28)",
    top: 280,
    right: -220,
    transform: [{ rotate: "6deg" }]
  },
  waveTwoA: {
    position: "absolute",
    width: 560,
    height: 290,
    borderRadius: 280,
    borderWidth: 1.5,
    borderColor: "rgba(84, 131, 179, 0.22)",
    top: 288,
    right: -210,
    transform: [{ rotate: "6deg" }]
  },
  waveTwoB: {
    position: "absolute",
    width: 600,
    height: 310,
    borderRadius: 300,
    borderWidth: 3.2,
    borderColor: "rgba(84, 131, 179, 0.34)",
    top: 272,
    right: -230,
    transform: [{ rotate: "6deg" }]
  },
  waveThree: {
    position: "absolute",
    width: 460,
    height: 240,
    borderRadius: 230,
    borderWidth: 1.6,
    borderColor: "rgba(5, 38, 89, 0.22)",
    bottom: 80,
    left: -140,
    transform: [{ rotate: "-4deg" }]
  },
  waveThreeA: {
    position: "absolute",
    width: 440,
    height: 230,
    borderRadius: 220,
    borderWidth: 1.4,
    borderColor: "rgba(5, 38, 89, 0.18)",
    bottom: 86,
    left: -130,
    transform: [{ rotate: "-4deg" }]
  },
  waveThreeB: {
    position: "absolute",
    width: 480,
    height: 250,
    borderRadius: 240,
    borderWidth: 2.8,
    borderColor: "rgba(5, 38, 89, 0.28)",
    bottom: 74,
    left: -150,
    transform: [{ rotate: "-4deg" }]
  },
  waveFour: {
    position: "absolute",
    width: 620,
    height: 320,
    borderRadius: 320,
    borderWidth: 1.6,
    borderColor: "rgba(125, 160, 202, 0.25)",
    top: 40,
    right: -240,
    transform: [{ rotate: "10deg" }]
  },
  waveFourA: {
    position: "absolute",
    width: 600,
    height: 310,
    borderRadius: 310,
    borderWidth: 1.4,
    borderColor: "rgba(125, 160, 202, 0.2)",
    top: 48,
    right: -230,
    transform: [{ rotate: "10deg" }]
  },
  waveFourB: {
    position: "absolute",
    width: 640,
    height: 330,
    borderRadius: 330,
    borderWidth: 3,
    borderColor: "rgba(125, 160, 202, 0.32)",
    top: 32,
    right: -250,
    transform: [{ rotate: "10deg" }]
  },
  waveFive: {
    position: "absolute",
    width: 540,
    height: 280,
    borderRadius: 280,
    borderWidth: 1.4,
    borderColor: "rgba(84, 131, 179, 0.22)",
    top: 200,
    left: -200,
    transform: [{ rotate: "-12deg" }]
  },
  waveFiveA: {
    position: "absolute",
    width: 520,
    height: 270,
    borderRadius: 270,
    borderWidth: 1.2,
    borderColor: "rgba(84, 131, 179, 0.18)",
    top: 208,
    left: -190,
    transform: [{ rotate: "-12deg" }]
  },
  waveFiveB: {
    position: "absolute",
    width: 560,
    height: 290,
    borderRadius: 290,
    borderWidth: 2.6,
    borderColor: "rgba(84, 131, 179, 0.28)",
    top: 192,
    left: -210,
    transform: [{ rotate: "-12deg" }]
  },
  waveSix: {
    position: "absolute",
    width: 500,
    height: 260,
    borderRadius: 260,
    borderWidth: 1.4,
    borderColor: "rgba(7, 45, 100, 0.2)",
    bottom: 10,
    right: -180,
    transform: [{ rotate: "5deg" }]
  },
  waveSixA: {
    position: "absolute",
    width: 480,
    height: 250,
    borderRadius: 250,
    borderWidth: 1.2,
    borderColor: "rgba(7, 45, 100, 0.16)",
    bottom: 16,
    right: -170,
    transform: [{ rotate: "5deg" }]
  },
  waveSixB: {
    position: "absolute",
    width: 520,
    height: 270,
    borderRadius: 270,
    borderWidth: 2.6,
    borderColor: "rgba(7, 45, 100, 0.24)",
    bottom: 4,
    right: -190,
    transform: [{ rotate: "5deg" }]
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 36
  },
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0
  },
  heroImageWrap: {
    height: 360,
    width: "120%",
    alignSelf: "center",
    marginHorizontal: -40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 600,
    borderBottomRightRadius: 600,
    overflow: "hidden",
    justifyContent: "flex-end"
  },
  heroImage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 600,
    borderBottomRightRadius: 600
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 38, 89, 0.55)"
  },
  heroContent: {
    padding: 20,
    gap: 8
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#7DA0CA",
    alignItems: "center",
    justifyContent: "center"
  },
  brandText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EAF2FF"
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#D9E7FF"
  },
  formCard: {
    marginTop: 0,
    marginHorizontal: 18,
    backgroundColor: "rgba(5, 38, 89, 0.82)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(125, 160, 202, 0.35)",
    shadowColor: "#052659",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    zIndex: 2
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#CFE0FF",
    marginBottom: 18
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(125, 160, 202, 0.45)",
    marginBottom: 14
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#F5F8FF"
  },
  optionsRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7DA0CA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  checkboxActive: {
    backgroundColor: "#7DA0CA",
    borderColor: "#7DA0CA"
  },
  checkboxText: {
    fontSize: 12,
    color: "#D9E7FF"
  },
  forgotLink: {
    fontSize: 12,
    color: "#EAF2FF",
    fontWeight: "600"
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#7DA0CA",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center"
  },
  submitText: {
    color: "#052659",
    fontWeight: "700",
    fontSize: 13
  },
  errorText: {
    color: "#FFD7D7",
    fontSize: 12,
    marginBottom: 6
  },
  dividerRow: {
    marginTop: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(125, 160, 202, 0.35)"
  },
  dividerText: {
    fontSize: 11,
    color: "#D0DEFF",
    letterSpacing: 1
  },
  socialRow: {
    gap: 10,
    marginBottom: 12
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 11
  },
  socialButtonGoogle: {
    backgroundColor: "#DB4437"
  },
  socialText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700"
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6
  },
  registerText: {
    fontSize: 12,
    color: "#D9E7FF"
  },
  registerLink: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700"
  }
});

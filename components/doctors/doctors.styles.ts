import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF1FF"
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden"
  },
  headerCurve: {
    position: "absolute",
    width: "140%",
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -170,
    left: "-20%"
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    color: "#DDE9FF",
    fontSize: 16,
    fontWeight: "700"
  },
  searchWrap: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0B1B3A"
  },
  listContent: {
    padding: 18,
    paddingBottom: 32,
    gap: 14
  },
  stateCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    alignItems: "center",
    gap: 8
  },
  stateText: {
    fontSize: 12,
    color: "#6B7C96"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardTop: {
    flexDirection: "row",
    gap: 12
  },
  cardInfo: {
    flex: 1
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  cardRole: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7C96"
  },
  metaRow: {
    marginTop: 10,
    gap: 6
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metaText: {
    fontSize: 11,
    color: "#6B7C96"
  },
  cardAvatar: {
    width: 92,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#F2F6FF"
  }
});

import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { getDoctorById, getDoctorScheduleWindows } from "../../services/doctor.service";
import { getBookedIntervals } from "../../services/appointment.service";
import { getServices, ServiceItem } from "../../services/service.service";
import { DoctorUser } from "../../types/user";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type WorkWindow = { day: string; start: string; end: string };
type ServiceTab = "procedure" | "consult";
type ConsultAt = "onsite" | "online";

const pad = (value: number) => (value < 10 ? `0${value}` : `${value}`);

const formatTimeLabel = (hours: number, minutes: number) => `${pad(hours)}:${pad(minutes)}`;

const parseTimeToMinutes = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] ?? "00", 10);
  const meridiem = match[3];
  if (meridiem) {
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const buildSlots = (windows: WorkWindow[]) => {
  if (!windows.length) return [] as string[];
  const slots: string[] = [];
  windows.forEach((window) => {
    const startMinutes = parseTimeToMinutes(window.start);
    const endMinutes = parseTimeToMinutes(window.end);
    if (startMinutes === null || endMinutes === null) return;
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(formatTimeLabel(hours, mins));
    }
  });
  return Array.from(new Set(slots));
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateISO = (value: Date) => {
  const year = value.getFullYear();
  const month = value.getMonth() + 1;
  const day = value.getDate();
  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${mm}-${dd}`;
};

const formatDateLabel = (value: Date) =>
  `${MONTH_LABELS[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`;

const formatPrice = (value?: number) => {
  if (!value || Number.isNaN(value)) return "";
  return `THB ${value.toLocaleString()}`;
};

const overlaps = (start: number, end: number, otherStart: number, otherEnd: number) =>
  start < otherEnd && end > otherStart;

const BookAppointmentScreen = () => {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleWindows, setScheduleWindows] = useState<WorkWindow[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [bookedIntervals, setBookedIntervals] = useState<Array<{ start: number; end: number }>>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceTab, setServiceTab] = useState<ServiceTab>("procedure");
  const [consultAt, setConsultAt] = useState<ConsultAt>("onsite");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const hasDoctorId = Boolean(doctorId && !Array.isArray(doctorId));

  useEffect(() => {
    let isMounted = true;
    const loadSchedule = async () => {
      if (!hasDoctorId || !doctorId || Array.isArray(doctorId)) {
        if (isMounted) {
          setScheduleWindows([]);
          setLoadingSchedule(false);
        }
        return;
      }
      try {
        const windows = await getDoctorScheduleWindows(doctorId);
        if (isMounted) {
          setScheduleWindows(windows);
        }
      } finally {
        if (isMounted) {
          setLoadingSchedule(false);
        }
      }
    };
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [doctorId, hasDoctorId]);

  useEffect(() => {
    let isMounted = true;
    const loadBookedTimes = async () => {
      if (!hasDoctorId || !doctorId || Array.isArray(doctorId)) {
        if (isMounted) {
          setBookedIntervals([]);
          setLoadingBooked(false);
        }
        return;
      }
      const dateLabel = formatDateISO(selectedDate);
      try {
        const intervals = await getBookedIntervals(doctorId, dateLabel);
        if (isMounted) {
          setBookedIntervals(intervals);
        }
      } finally {
        if (isMounted) {
          setLoadingBooked(false);
        }
      }
    };
    loadBookedTimes();
    return () => {
      isMounted = false;
    };
  }, [doctorId, hasDoctorId, selectedDate]);

  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      try {
        const data = await getServices();
        if (isMounted) {
          setServices(data);
        }
      } finally {
        if (isMounted) {
          setServicesLoading(false);
        }
      }
    };
    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDoctor = async () => {
      if (!hasDoctorId || !doctorId || Array.isArray(doctorId)) {
        if (isMounted) {
          setDoctor(null);
          setLoadingDoctor(false);
        }
        return;
      }
      try {
        const data = await getDoctorById(doctorId);
        if (isMounted) {
          setDoctor(data);
        }
      } finally {
        if (isMounted) {
          setLoadingDoctor(false);
        }
      }
    };
    loadDoctor();
    return () => {
      isMounted = false;
    };
  }, [doctorId, hasDoctorId]);

  const dayWindows = useMemo(() => {
    const weekday = selectedDate.getDay();
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday];
    const needle = dayName.toLowerCase();
    return scheduleWindows.filter(
      (window) => window.start && window.end && window.day.toLowerCase().includes(needle)
    );
  }, [scheduleWindows, selectedDate]);

  const timeSlots = useMemo(() => buildSlots(dayWindows), [dayWindows]);
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );
  const selectedDuration = selectedService?.durationMin || 30;

  const windowIntervals = useMemo(() => {
    return dayWindows
      .map((window) => {
        const start = parseTimeToMinutes(window.start);
        const end = parseTimeToMinutes(window.end);
        if (start === null || end === null) return null;
        return { start, end };
      })
      .filter((item): item is { start: number; end: number } => Boolean(item));
  }, [dayWindows]);

  const isSlotWithinWindow = (start: number, end: number) =>
    windowIntervals.some((window) => start >= window.start && end <= window.end);

  const isSlotBlocked = (start: number, end: number) =>
    bookedIntervals.some((interval) => overlaps(start, end, interval.start, interval.end));

  const monthDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date; key: string }> = [];
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      days.push({ date, key: `${year}-${month}-${day}` });
    }
    return days;
  }, [currentMonth]);

  const procedureServices = useMemo(
    () => services.filter((service) => !service.isConsultation),
    [services]
  );
  const consultationServices = useMemo(
    () => services.filter((service) => service.isConsultation),
    [services]
  );

  const procedureCategories = useMemo(() => {
    const categories = Array.from(
      new Set(
        procedureServices
          .map((service) => service.category)
          .filter(Boolean)
          .map((value) => value!.trim())
      )
    );
    return categories.length ? categories : ["General"];
  }, [procedureServices]);

  useEffect(() => {
    if (!procedureCategories.length) {
      if (selectedCategory) setSelectedCategory("");
      if (selectedType) setSelectedType("");
      return;
    }
    if (!selectedCategory || !procedureCategories.includes(selectedCategory)) {
      setSelectedCategory(procedureCategories[0]);
    }
  }, [procedureCategories, selectedCategory]);

  const procedureTypes = useMemo(() => {
    const scoped = selectedCategory && selectedCategory !== "General"
      ? procedureServices.filter((service) => service.category === selectedCategory)
      : procedureServices;
    const types = Array.from(
      new Set(
        scoped
          .map((service) => service.type)
          .filter(Boolean)
          .map((value) => value!.trim())
      )
    );
    return types.length ? types : [];
  }, [procedureServices, selectedCategory]);

  useEffect(() => {
    if (!procedureTypes.length) {
      if (selectedType) setSelectedType("");
      return;
    }
    if (!selectedType || !procedureTypes.includes(selectedType)) {
      setSelectedType(procedureTypes[0]);
    }
  }, [procedureTypes, selectedType]);

  const currentServices = useMemo(() => {
    if (serviceTab === "consult") return consultationServices;
    let scoped = procedureServices;
    if (selectedCategory && selectedCategory !== "General") {
      scoped = scoped.filter((service) => service.category === selectedCategory);
    }
    if (selectedType) {
      scoped = scoped.filter((service) => service.type === selectedType);
    }
    return scoped;
  }, [consultationServices, procedureServices, selectedCategory, selectedType, serviceTab]);

  const availabilityDays = useMemo(() => {
    if (!scheduleWindows.length) return 0;
    const uniqueDays = new Set(
      scheduleWindows
        .map((item) => item.day)
        .filter(Boolean)
        .map((value) => value.trim().toLowerCase())
    );
    return uniqueDays.size;
  }, [scheduleWindows]);

  const stats = useMemo(
    () => [
      {
        label: "Years Exp.",
        value: doctor?.experience ? `${doctor.experience} yrs` : "—",
        icon: "briefcase"
      },
      {
        label: "Days/Week",
        value: availabilityDays ? `${availabilityDays} days` : "—",
        icon: "calendar"
      },
      {
        label: "Rating",
        value: typeof doctor?.rating === "number" ? doctor.rating.toFixed(1) : "—",
        icon: "star"
      }
    ],
    [doctor?.experience, doctor?.rating, availabilityDays]
  );

  const serviceSummary = useMemo(() => {
    if (!selectedService) {
      return {
        title: "No service selected",
        meta: "Choose a service to see details"
      };
    }
    const metaParts = [];
    if (selectedService.durationMin) metaParts.push(`${selectedService.durationMin} min`);
    if (selectedService.price) metaParts.push(formatPrice(selectedService.price));
    return {
      title: selectedService.name,
      meta: metaParts.join(" • ") || "Service details"
    };
  }, [selectedService]);

  const goToMonth = (direction: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(next);
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedTime(null);
  };

  const onSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const onGoToSummary = () => {
    if (!hasDoctorId || !doctorId || Array.isArray(doctorId)) {
      Alert.alert("Select doctor", "Please select a doctor before booking.");
      return;
    }
    if (!selectedServiceId) {
      Alert.alert("Select service", "Please choose a service before booking.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Select time", "Please choose a time slot before booking.");
      return;
    }
    const startMinutes = parseTimeToMinutes(selectedTime);
    if (startMinutes === null) {
      Alert.alert("Select time", "Please choose a time slot before booking.");
      return;
    }
    const endMinutes = startMinutes + selectedDuration;
    if (!isSlotWithinWindow(startMinutes, endMinutes) || isSlotBlocked(startMinutes, endMinutes)) {
      Alert.alert("Time unavailable", "This time slot is already booked.");
      return;
    }
    router.push({
      pathname: "/booking/booking-summary",
      params: {
        doctorId,
        serviceId: selectedServiceId,
        date: formatDateISO(selectedDate),
        time: selectedTime,
        consultAt: serviceTab === "consult" ? consultAt : undefined
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Appointment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCard}>
        <Image
          source={{
            uri:
              doctor?.photoUrl ||
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroActions}>
          <Pressable style={styles.circleButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={14} color="#1E2C4C" />
          </Pressable>
          <Pressable style={styles.circleButton}>
            <FontAwesome name="heart-o" size={14} color="#1E2C4C" />
          </Pressable>
        </View>
        <View style={styles.heroRating}>
          <FontAwesome name="star" size={12} color="#F6C453" />
          <Text style={styles.heroRatingText}>
            {typeof doctor?.rating === "number" ? doctor.rating.toFixed(1) : "—"}
          </Text>
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>
            {loadingDoctor ? "Loading doctor..." : doctor?.name || "Doctor"}
          </Text>
          <Text style={styles.heroMeta}>
            {doctor?.doctorTypeName || doctor?.doctorType || "Medical Specialist"}
            {doctor?.experience ? ` • ${doctor.experience} yrs` : ""}
          </Text>
        </View>
      </View>


      <View style={styles.statsRow}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <FontAwesome name={item.icon as any} size={14} color="#5D87B7" />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Select Service</Text>
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabChip, serviceTab === "procedure" && styles.tabChipActive]}
          onPress={() => {
            setServiceTab("procedure");
            setSelectedServiceId(null);
          }}
        >
          <Text style={[styles.tabText, serviceTab === "procedure" && styles.tabTextActive]}>
            Procedure
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabChip, serviceTab === "consult" && styles.tabChipActive]}
          onPress={() => {
            setServiceTab("consult");
            setSelectedServiceId(null);
          }}
        >
          <Text style={[styles.tabText, serviceTab === "consult" && styles.tabTextActive]}>
            Consultation
          </Text>
        </Pressable>
      </View>

      {serviceTab === "consult" && (
        <View style={styles.consultRow}>
          <Text style={styles.consultLabel}>Consultation At</Text>
          <View style={styles.consultOptions}>
            {(["onsite", "online"] as const).map((option) => {
              const active = consultAt === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.consultChip, active && styles.consultChipActive]}
                  onPress={() => setConsultAt(option)}
                >
                  <Text style={[styles.consultText, active && styles.consultTextActive]}>
                    {option === "onsite" ? "Onsite" : "Online"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {serviceTab === "procedure" && procedureCategories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {procedureCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => {
                  setSelectedCategory(category);
                  setSelectedServiceId(null);
                }}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {serviceTab === "procedure" && procedureTypes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeRow}
        >
          {procedureTypes.map((type) => {
            const isActive = selectedType === type;
            return (
              <Pressable
                key={type}
                style={[styles.typeChip, isActive && styles.typeChipActive]}
                onPress={() => {
                  setSelectedType(type);
                  setSelectedServiceId(null);
                }}
              >
                <Text style={[styles.typeText, isActive && styles.typeTextActive]}>{type}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {servicesLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading services...</Text>
        </View>
      ) : currentServices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No services available</Text>
        </View>
      ) : (
        <View style={styles.serviceGrid}>
          {currentServices.map((service) => {
            const isActive = selectedServiceId === service.id;
            return (
              <Pressable
                key={service.id}
                style={[styles.serviceCard, isActive && styles.serviceCardActive]}
                onPress={() => setSelectedServiceId(service.id)}
              >
                <Text style={[styles.serviceName, isActive && styles.serviceNameActive]}>
                  {service.name}
                </Text>
                {service.durationMin ? (
                  <Text style={[styles.serviceMeta, isActive && styles.serviceMetaActive]}>
                    {service.durationMin} min
                  </Text>
                ) : null}
                {service.price ? (
                  <Text style={[styles.serviceMeta, isActive && styles.serviceMetaActive]}>
                    {formatPrice(service.price)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <FontAwesome name="stethoscope" size={14} color="#0B1B3A" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Selected Service</Text>
            <Text style={styles.summaryValue}>{serviceSummary.title}</Text>
            <Text style={styles.summaryMeta}>{serviceSummary.meta}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <FontAwesome name="calendar" size={14} color="#0B1B3A" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Schedule</Text>
            <Text style={styles.summaryValue}>{formatDateLabel(selectedDate)}</Text>
            <Text style={styles.summaryMeta}>{selectedTime ? selectedTime : "Pick a time slot"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.monthSwitch}>
          <Pressable style={styles.monthNavButton} onPress={() => goToMonth(-1)}>
            <FontAwesome name="chevron-left" size={12} color="#33476F" />
          </Pressable>
          <Text style={styles.monthSwitchLabel}>{MONTH_LABELS[currentMonth.getMonth()]}</Text>
          <Pressable style={styles.monthNavButton} onPress={() => goToMonth(1)}>
            <FontAwesome name="chevron-right" size={12} color="#33476F" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scheduleRow}
      >
        {monthDates.map((item) => {
          const isSelected = isSameDay(item.date, selectedDate);
          return (
            <Pressable
              key={item.key}
              style={[styles.datePill, isSelected && styles.datePillActive]}
              onPress={() => onSelectDate(item.date)}
            >
              <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>
                {item.date.getDate()}
              </Text>
              <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
                {WEEKDAY_SHORT[item.date.getDay()]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Time</Text>
      {!hasDoctorId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Select a doctor to see available times</Text>
        </View>
      ) : loadingSchedule || loadingBooked ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading available times...</Text>
        </View>
      ) : timeSlots.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No working hours on this day</Text>
        </View>
      ) : (
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const isActive = selectedTime === slot;
            const startMinutes = parseTimeToMinutes(slot) ?? 0;
            const endMinutes = startMinutes + selectedDuration;
            const fitsWindow = isSlotWithinWindow(startMinutes, endMinutes);
            const isBooked = isSlotBlocked(startMinutes, endMinutes);
            const isDisabled = !fitsWindow || isBooked;
            return (
              <Pressable
                key={slot}
                style={[
                  styles.timeChip,
                  isDisabled && styles.timeChipDisabled,
                  isActive && !isDisabled && styles.timeChipActive
                ]}
                onPress={() => {
                  if (isDisabled) return;
                  setSelectedTime(slot);
                }}
              >
                <Text
                  style={[
                    styles.timeText,
                    isDisabled && styles.timeTextDisabled,
                    isActive && !isDisabled && styles.timeTextActive
                  ]}
                >
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        style={styles.bookButton}
        onPress={onGoToSummary}
      >
        <Text style={styles.bookText}>Confirm Appointment</Text>
      </Pressable>
    </ScrollView>
  );
};

export default BookAppointmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF"
  },
  content: {
    padding: 18,
    paddingBottom: 32
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  headerSpacer: {
    width: 34
  },
  heroCard: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#D9E6F5",
    shadowColor: "#0B1B3A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  heroImage: {
    width: "100%",
    height: 250
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 27, 58, 0.08)"
  },
  heroActions: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroRating: {
    position: "absolute",
    left: 16,
    top: 128,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.84)"
  },
  heroRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  heroInfo: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)"
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  heroMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#52617D",
    fontWeight: "600"
  },
  statsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3ECF9",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  statValue: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7C96"
  },
  summaryCard: {
    marginTop: 16,
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
  consultRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE7F8"
  },
  consultLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7C96",
    textTransform: "uppercase"
  },
  consultOptions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10
  },
  consultChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#E3ECF9",
    alignItems: "center"
  },
  consultChipActive: {
    backgroundColor: "#0B2B63",
    borderColor: "#0B2B63"
  },
  consultText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#49608F"
  },
  consultTextActive: {
    color: "white"
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F1F5FF",
    alignItems: "center",
    justifyContent: "center"
  },
  summaryInfo: {
    flex: 1
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7C96",
    textTransform: "uppercase"
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7C96"
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 12
  },
  sectionHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  tabRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10
  },
  tabChip: {
    flex: 1,
    backgroundColor: "#F1F5FF",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  tabChipActive: {
    backgroundColor: "#0B2B63",
    borderColor: "#0B2B63"
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#49608F"
  },
  tabTextActive: {
    color: "white"
  },
  categoryRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  categoryChipActive: {
    backgroundColor: "#5D87B7",
    borderColor: "#5D87B7"
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5A6F94"
  },
  categoryTextActive: {
    color: "white"
  },
  typeRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  typeChipActive: {
    backgroundColor: "#0B2B63",
    borderColor: "#0B2B63"
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#49608F"
  },
  typeTextActive: {
    color: "white"
  },
  serviceGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#F7FAFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  serviceCardActive: {
    backgroundColor: "#0B2B63",
    borderColor: "#0B2B63"
  },
  serviceName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  serviceNameActive: {
    color: "white"
  },
  serviceMeta: {
    marginTop: 4,
    fontSize: 10,
    color: "#6B7C96",
    fontWeight: "600"
  },
  serviceMetaActive: {
    color: "#DCE8FF"
  },
  monthSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  monthNavButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#EFF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  monthSwitchLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2C3E63"
  },
  scheduleRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4
  },
  datePill: {
    width: 64,
    backgroundColor: "#F5F8FF",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  datePillActive: {
    backgroundColor: "#5D87B7",
    borderColor: "#5D87B7"
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  dateNumberActive: {
    color: "white"
  },
  dateMonth: {
    marginTop: 2,
    fontSize: 10,
    color: "#6B7C96",
    fontWeight: "600"
  },
  dateMonthActive: {
    color: "#E8F0FF"
  },
  timeGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  timeChip: {
    minWidth: "22%",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F5F8FF",
    alignItems: "center"
  },
  timeChipActive: {
    backgroundColor: "#5483B3"
  },
  timeChipDisabled: {
    backgroundColor: "#EEF2F7",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7C96"
  },
  timeTextActive: {
    color: "white",
    fontWeight: "700"
  },
  timeTextDisabled: {
    color: "#A8B4C7",
    fontWeight: "600"
  },
  emptyState: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F5F8FF"
  },
  emptyText: {
    fontSize: 12,
    color: "#8A9AB4"
  },
  bookButton: {
    marginTop: 22,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  bookText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  }
});


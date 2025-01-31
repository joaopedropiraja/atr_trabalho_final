import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { toMonetaryFormat } from "@/utils/toMonetaryFormat";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { useLocalSearchParams } from "expo-router";
import {
  createAlert,
  getAlertsByCryptoCoinIdAndLoggedUser,
} from "@/api/alerts/endpoints";
import { Alert, AlertType } from "@/api/alerts/types";

const PriceAlertsScreen: FC = () => {
  const { cryptoCoinId, name, imageSrc } = useLocalSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAlertType, setNewAlertType] = useState<AlertType>(
    AlertType.PRICE_LOWER_THRESHOLD
  );
  const [newAlertValue, setNewAlertValue] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[] | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await getAlertsByCryptoCoinIdAndLoggedUser(cryptoCoinId);
        setAlerts(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [name, imageSrc]);

  const handleAddAlert = async () => {
    if (!newAlertValue) return;

    const newAlert = {
      cryptoCoinId: cryptoCoinId,
      type: newAlertType,
      value: parseFloat(newAlertValue),
    };

    setIsLoading(true);
    try {
      const data = await createAlert(newAlert);
      setAlerts((alerts || []).concat(data));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }

    setIsModalVisible(false);
    setNewAlertValue("");
    setNewAlertType(AlertType.PRICE_LOWER_THRESHOLD);
  };

  const formatTriggeredAt = (timestamp: string | null) => {
    if (!timestamp) return "Ativado";

    const date = new Date(timestamp);
    const timeZone = "America/Sao_Paulo";

    const zonedDate = toZonedTime(date, timeZone);
    return `Acionado em ${format(zonedDate, "dd/MM/yyyy")}`;
  };

  if (isLoading || !alerts?.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00FFFF" />
        <Text style={styles.loaderText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: String(imageSrc) }} style={styles.logo} />
        <View>
          <Text style={styles.coinName}>{name}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addAlert}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {(alerts || []).map((alert) => (
        <View key={alert._id} style={styles.alertItem}>
          <View style={styles.alertInfo}>
            <Text
              style={[
                styles.alertType,
                String(alert.type) === AlertType.PRICE_UPPER_THRESHOLD
                  ? styles.green
                  : styles.red,
              ]}
            >
              {String(alert.type) === AlertType.PRICE_UPPER_THRESHOLD
                ? "Acima de"
                : "Abaixo de"}{" "}
              {toMonetaryFormat(alert.value)}
            </Text>
            <Text style={styles.triggeredAt}>
              {formatTriggeredAt(alert.triggeredAt)}
            </Text>
          </View>
        </View>
      ))}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Alerta</Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newAlertType === AlertType.PRICE_LOWER_THRESHOLD &&
                    styles.typeButtonActive,
                ]}
                onPress={() => setNewAlertType(AlertType.PRICE_LOWER_THRESHOLD)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newAlertType === AlertType.PRICE_LOWER_THRESHOLD &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Abaixo de
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newAlertType === AlertType.PRICE_UPPER_THRESHOLD &&
                    styles.typeButtonActive,
                ]}
                onPress={() => setNewAlertType(AlertType.PRICE_UPPER_THRESHOLD)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newAlertType === AlertType.PRICE_UPPER_THRESHOLD &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Acima de
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Digite o valor"
              placeholderTextColor="#AAA"
              value={newAlertValue}
              onChangeText={(text) => setNewAlertValue(text)}
            />

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.addButton} onPress={handleAddAlert}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PriceAlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  loaderText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  coinName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  coinSymbol: {
    color: "#AAA",
    fontSize: 14,
  },
  addAlert: {
    color: "#00AFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  alertInfo: {
    flex: 1,
    marginRight: 12,
  },
  alertType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  green: {
    color: "#4ADE80",
  },
  red: {
    color: "#EF4444",
  },
  triggeredAt: {
    color: "#AAA",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#333",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#00FFFF",
  },
  typeButtonText: {
    color: "#AAA",
    fontSize: 16,
  },
  typeButtonTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 8,
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#FF4444",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#00FFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

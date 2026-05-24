import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { ModalAddPlant } from "@/src/modals/ModalAddPlant";

// ─── Mocks de dependencias ─────────────────────────────────────────────────────

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "test-uid", email: "test@example.com" } }),
}));

jest.mock("@/src/hooks/useNetworkStatus", () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock("@/src/modals/ModalCamera", () => ({
  ModalCamera: () => null,
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/services/permissionService", () => ({
  default: {
    requestMediaLibraryPermission: jest.fn().mockResolvedValue("granted"),
    isGranted: jest.fn().mockReturnValue(true),
  },
}));

jest.mock("@/src/services/plantIdService", () => ({
  identifyPlant: jest.fn().mockResolvedValue({
    identified: false,
    name: "",
    scientificName: "",
    probability: 0,
    waterFrequencyDays: 7,
    category: "tropicales",
    allSuggestions: [],
  }),
}));

jest.mock("@/src/services/offlineSyncService", () => ({
  enqueue: jest.fn(),
  persistImageLocally: jest.fn(),
}));

// ─── Suite ────────────────────────────────────────────────────────────────────

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onPlantAdded: jest.fn(),
};

describe("ModalAddPlant — validación de formulario", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
  });

  it("muestra pantalla de opciones al abrir", () => {
    render(<ModalAddPlant {...defaultProps} />);
    expect(screen.getByText("Agregar planta")).toBeTruthy();
    expect(screen.getByText("Ingresar manualmente")).toBeTruthy();
  });

  it("navega al formulario al presionar 'Ingresar manualmente'", () => {
    render(<ModalAddPlant {...defaultProps} />);
    fireEvent.press(screen.getByText("Ingresar manualmente"));
    expect(screen.getByText("Nueva planta")).toBeTruthy();
    expect(screen.getByText("Guardar planta")).toBeTruthy();
  });

  it("muestra alerta de error al intentar guardar sin nombre", () => {
    render(<ModalAddPlant {...defaultProps} />);
    fireEvent.press(screen.getByText("Ingresar manualmente"));
    fireEvent.press(screen.getByText("Guardar planta"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Campo requerido",
      "El nombre de la planta es obligatorio."
    );
  });

  it("llama onPlantAdded con datos correctos al guardar con nombre válido", async () => {
    const onPlantAdded = jest.fn();
    render(<ModalAddPlant {...defaultProps} onPlantAdded={onPlantAdded} />);
    fireEvent.press(screen.getByText("Ingresar manualmente"));
    fireEvent.changeText(
      screen.getByPlaceholderText("ej. Monstera Deliciosa"),
      "Sábila"
    );
    fireEvent.press(screen.getByText("Guardar planta"));
    await waitFor(() => {
      expect(onPlantAdded).toHaveBeenCalledTimes(1);
    });
    const plant = onPlantAdded.mock.calls[0][0];
    expect(plant.name).toBe("Sábila");
    expect(plant.location).toBe("interior");
    expect(plant.category).toBe("suculentas");
    expect(plant.waterFrequency).toBe("c/7 días");
  });
});

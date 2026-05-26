import React from "react";
import { Alert } from "react-native";
import { act, render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { ModalAddPlant } from "@/src/modals/ModalAddPlant";
import * as ImagePicker from "expo-image-picker";

// Variables that start with "mock" may be used inside jest.mock factories (Jest hoisting exception)
let mockNetworkConnected = true;
let mockCameraCaptureCb: ((uri: string) => void) | null = null;

// ─── Module mocks ───────────────────────────────────────────────────────────────

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "test-uid", email: "test@example.com" } }),
}));

jest.mock("@/src/hooks/useNetworkStatus", () => ({
  useNetworkStatus: () => ({ isConnected: mockNetworkConnected }),
}));

jest.mock("@/src/modals/ModalCamera", () => ({
  ModalCamera: ({ visible, onCapture }: { visible: boolean; onCapture: (uri: string) => void }) => {
    if (visible) mockCameraCaptureCb = onCapture;
    return null;
  },
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/services/permissionService", () => ({
  __esModule: true,
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
    description: "",
    allSuggestions: [],
  }),
}));

jest.mock("@/src/services/offlineSyncService", () => ({
  enqueue: jest.fn().mockResolvedValue(undefined),
  persistImageLocally: jest.fn().mockResolvedValue("file:///local/plant.jpg"),
}));

// ─── XHR mock helper ────────────────────────────────────────────────────────────

const MOCK_BLOB = new Blob(["i".repeat(100)], { type: "image/jpeg" });

function setupXhr(opts?: { fail?: boolean; blob?: Blob }) {
  const blob = opts?.blob ?? MOCK_BLOB;
  const inst: any = {
    open: jest.fn(),
    responseType: "",
    response: null as Blob | null,
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
  };
  inst.send = jest.fn().mockImplementation(() => {
    if (opts?.fail) {
      Promise.resolve().then(() => inst.onerror?.());
    } else {
      inst.response = blob;
      Promise.resolve().then(() => inst.onload?.());
    }
  });
  (global as any).XMLHttpRequest = jest.fn(() => inst);
  return inst;
}

// ─── Shared props ───────────────────────────────────────────────────────────────

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onPlantAdded: jest.fn(),
};

// ─── Suite: formulario básico ───────────────────────────────────────────────────

describe("ModalAddPlant — validación de formulario", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
    mockCameraCaptureCb = null;
    mockNetworkConnected = true;
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

// ─── Suite: flujo de foto ───────────────────────────────────────────────────────

describe("ModalAddPlant — flujo de foto", () => {
  const GALLERY_URI = "content://media/external/images/1234";
  const CAMERA_URI = "file:///cache/Camera/photo.jpg";
  const DOWNLOAD_URL = "https://mock-url.com/photo";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
    mockCameraCaptureCb = null;
    mockNetworkConnected = true;

    const permSvc = jest.requireMock("@/src/services/permissionService").default;
    permSvc.requestMediaLibraryPermission.mockResolvedValue("granted");
    permSvc.isGranted.mockReturnValue(true);

    const offlineSvc = jest.requireMock("@/src/services/offlineSyncService");
    offlineSvc.persistImageLocally.mockResolvedValue("file:///local/plant.jpg");
    offlineSvc.enqueue.mockResolvedValue(undefined);

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: GALLERY_URI }],
    });
  });

  it("galería: selecciona foto y la sube a Firebase Storage", async () => {
    setupXhr();
    const onPlantAdded = jest.fn();
    render(<ModalAddPlant {...defaultProps} onPlantAdded={onPlantAdded} />);

    fireEvent.press(screen.getByText("Elegir de galería"));
    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText("ej. Monstera Deliciosa"), "Cactus");
    fireEvent.press(screen.getByText("Guardar planta"));

    await waitFor(() => expect(onPlantAdded).toHaveBeenCalledTimes(1));
    expect(onPlantAdded.mock.calls[0][0].image).toBe(DOWNLOAD_URL);
  });

  it("galería: permiso denegado → alerta y navega al formulario", async () => {
    const permSvc = jest.requireMock("@/src/services/permissionService").default;
    permSvc.requestMediaLibraryPermission.mockResolvedValue("denied");
    permSvc.isGranted.mockReturnValue(false);

    render(<ModalAddPlant {...defaultProps} />);
    fireEvent.press(screen.getByText("Elegir de galería"));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permiso requerido",
        "Necesitamos acceso a la galería."
      )
    );
    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());
  });

  it("galería: selección cancelada → formulario sin imagen", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });

    render(<ModalAddPlant {...defaultProps} />);
    fireEvent.press(screen.getByText("Elegir de galería"));

    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());
    expect(screen.getByText("Agregar foto")).toBeTruthy();
  });

  it("cámara: captura foto y la sube a Firebase Storage", async () => {
    setupXhr();
    const onPlantAdded = jest.fn();
    render(<ModalAddPlant {...defaultProps} onPlantAdded={onPlantAdded} />);

    fireEvent.press(screen.getByText("Tomar fotografía"));

    await act(async () => {
      mockCameraCaptureCb?.(CAMERA_URI);
    });

    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText("ej. Monstera Deliciosa"), "Monstera");
    fireEvent.press(screen.getByText("Guardar planta"));

    await waitFor(() => expect(onPlantAdded).toHaveBeenCalledTimes(1));
    expect(onPlantAdded.mock.calls[0][0].image).toBe(DOWNLOAD_URL);
  });

  it("upload: error de red → muestra alerta de error", async () => {
    setupXhr({ fail: true });
    render(<ModalAddPlant {...defaultProps} />);

    fireEvent.press(screen.getByText("Elegir de galería"));
    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText("ej. Monstera Deliciosa"), "Rosa");
    fireEvent.press(screen.getByText("Guardar planta"));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "No se pudo guardar la planta. Intenta de nuevo."
      )
    );
  });

  it("offline + imagen → persistImageLocally + enqueue + pendingUpload:true", async () => {
    mockNetworkConnected = false;
    const onPlantAdded = jest.fn();
    render(<ModalAddPlant {...defaultProps} onPlantAdded={onPlantAdded} />);

    fireEvent.press(screen.getByText("Elegir de galería"));
    await waitFor(() => expect(screen.getByText("Nueva planta")).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText("ej. Monstera Deliciosa"), "Fern");
    fireEvent.press(screen.getByText("Guardar planta"));

    await waitFor(() => expect(onPlantAdded).toHaveBeenCalledTimes(1));
    const plant = onPlantAdded.mock.calls[0][0];
    expect(plant.pendingUpload).toBe(true);

    const offlineSvc = jest.requireMock("@/src/services/offlineSyncService");
    expect(offlineSvc.persistImageLocally).toHaveBeenCalledWith(GALLERY_URI, expect.any(String));
    expect(offlineSvc.enqueue).toHaveBeenCalled();
  });
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/src/config/firebase";
import { identifyPlant } from "@/src/services/plantIdService";

const QUEUE_KEY = "@gardenGenie:pendingSync";
const IMAGE_DIR = FileSystem.documentDirectory + "plant_images/";

export interface PendingSync {
  plantId: string;
  userId: string;
  imagePath: string;
  needsIdentification: boolean;
}

export async function enqueue(item: PendingSync): Promise<void> {
  const queue = await getQueue();
  const updated = [...queue.filter((i) => i.plantId !== item.plantId), item];
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

async function dequeue(plantId: string): Promise<void> {
  const queue = await getQueue();
  await AsyncStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(queue.filter((i) => i.plantId !== plantId))
  );
}

export async function getQueue(): Promise<PendingSync[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function persistImageLocally(
  uri: string,
  plantId: string
): Promise<string> {
  await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
  const dest = IMAGE_DIR + plantId + "." + ext;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function syncPendingUploads(userId: string): Promise<void> {
  const queue = await getQueue();
  for (const item of queue) {
    if (item.userId !== userId) continue;
    try {
      const info = await FileSystem.getInfoAsync(item.imagePath);
      if (!info.exists) {
        await dequeue(item.plantId);
        continue;
      }

      const response = await fetch(item.imagePath);
      const blob = await response.blob();
      const storageRef = ref(storage, `users/${userId}/plants/${item.plantId}`);
      await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
      const url = await getDownloadURL(storageRef);

      const plantRef = doc(db, "users", userId, "plants", item.plantId);
      await updateDoc(plantRef, { image: url, pendingUpload: false });

      if (item.needsIdentification) {
        try {
          const result = await identifyPlant(item.imagePath);
          if (result.identified) {
            const snap = await getDoc(plantRef);
            if (snap.exists()) {
              const d = snap.data();
              const upd: Record<string, any> = {};
              if (!d.name) upd.name = result.name;
              if (!d.scientificName) upd.scientificName = result.scientificName;
              if (d.category === "tropicales") upd.category = result.category;
              if (Object.keys(upd).length > 0) await updateDoc(plantRef, upd);
            }
          }
        } catch {
          // identification failure non-fatal
        }
      }

      await dequeue(item.plantId);
    } catch {
      // individual failure non-fatal — retry next reconnect
    }
  }
}

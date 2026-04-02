import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const KEY = "@formulab_device_id";

let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) { cachedId = stored; return stored; }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(KEY, id);
  cachedId = id;
  return id;
}

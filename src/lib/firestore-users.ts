import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit 
} from "firebase/firestore";
import { db } from "./firebase";
import { SafeUser, Address, UserRole } from "@/types";
import { hashPassword, comparePassword } from "./auth";

export interface FirestoreUserData {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string | null;
  role: UserRole;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export async function findUserByEmail(email: string): Promise<FirestoreUserData | null> {
  try {
    const colRef = collection(db, "users");
    const q = query(colRef, where("email", "==", email.toLowerCase().trim()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      // If demo admin is queried and not found, auto-create
      if (email.toLowerCase().trim() === "admin@localshop.com") {
        return createAdminDemoUser();
      }
      return null;
    }
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as FirestoreUserData;
  } catch (error) {
    console.error("findUserByEmail error:", error);
    return null;
  }
}

export async function findUserById(id: string): Promise<FirestoreUserData | null> {
  try {
    const docRef = doc(db, "users", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as FirestoreUserData;
    }
    return null;
  } catch (error) {
    console.error("findUserById error:", error);
    return null;
  }
}

export async function createFirestoreUser(data: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  id?: string;
}): Promise<SafeUser> {
  const email = data.email.toLowerCase().trim();
  const passwordHash = data.password ? await hashPassword(data.password) : undefined;
  
  const userData: Omit<FirestoreUserData, "id"> = {
    name: data.name || email.split("@")[0] || "Customer",
    email,
    passwordHash,
    phone: data.phone || null,
    role: data.role || "CUSTOMER",
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let userId = data.id;
  if (userId) {
    await setDoc(doc(db, "users", userId), userData, { merge: true });
  } else {
    const res = await addDoc(collection(db, "users"), userData);
    userId = res.id;
  }

  return {
    id: userId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
    createdAt: userData.createdAt,
  };
}

export async function updateUserProfile(
  userId: string, 
  data: Partial<SafeUser>
): Promise<SafeUser | null> {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  const updated = await findUserById(userId);
  if (!updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    createdAt: updated.createdAt,
  };
}

// User Addresses
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const user = await findUserById(userId);
  return user?.addresses || [];
}

export async function addUserAddress(userId: string, address: Omit<Address, "id" | "userId">): Promise<Address> {
  const user = await findUserById(userId);
  const currentAddresses = user?.addresses || [];
  
  const newAddress: Address = {
    id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    ...address,
    isDefault: address.isDefault !== undefined ? address.isDefault : currentAddresses.length === 0,
  };

  let updatedAddresses = [...currentAddresses];
  if (newAddress.isDefault) {
    updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
  }
  updatedAddresses.push(newAddress);

  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    addresses: updatedAddresses,
    updatedAt: new Date().toISOString(),
  });

  return newAddress;
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  updates: Partial<Address>
): Promise<Address | null> {
  const user = await findUserById(userId);
  if (!user || !user.addresses) return null;

  let targetAddress: Address | null = null;
  let updatedAddresses = user.addresses.map((a) => {
    if (a.id === addressId) {
      targetAddress = { ...a, ...updates, updatedAt: new Date().toISOString() };
      return targetAddress;
    }
    return a;
  });

  if (!targetAddress) return null;

  if (updates.isDefault) {
    updatedAddresses = updatedAddresses.map((a) =>
      a.id === addressId ? a : { ...a, isDefault: false }
    );
  }

  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    addresses: updatedAddresses,
    updatedAt: new Date().toISOString(),
  });

  return targetAddress;
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<boolean> {
  const user = await findUserById(userId);
  if (!user || !user.addresses) return false;

  const updatedAddresses = user.addresses.filter((a) => a.id !== addressId);
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    addresses: updatedAddresses,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function getAllCustomers(): Promise<SafeUser[]> {
  try {
    const colRef = collection(db, "users");
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => {
      const u = d.data() as FirestoreUserData;
      return {
        id: d.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || "CUSTOMER",
        createdAt: u.createdAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("getAllCustomers error:", error);
    return [];
  }
}

async function createAdminDemoUser(): Promise<FirestoreUserData> {
  const passwordHash = await hashPassword("Admin@12345");
  const adminData = {
    name: "Shop Manager (Admin)",
    email: "admin@localshop.com",
    passwordHash,
    phone: "+91 98765 43210",
    role: "ADMIN" as UserRole,
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const res = await addDoc(collection(db, "users"), adminData);
  return { id: res.id, ...adminData };
}

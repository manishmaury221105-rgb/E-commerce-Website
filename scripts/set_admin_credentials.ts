import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, setDoc, doc, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("m@221105", 10);
  console.log("Generated hash for m@221105:", hash);

  const usersRef = collection(db, "users");
  
  // 1. Update or create manish@2211.com
  const q1 = query(usersRef, where("email", "in", ["manish@2211.com", "manish@2211", "admin@localshop.com"]));
  const snap1 = await getDocs(q1);

  if (!snap1.empty) {
    for (const d of snap1.docs) {
      console.log("Updating existing user doc:", d.id, d.data().email);
      await setDoc(doc(db, "users", d.id), {
        name: "Manish Maurya (Admin)",
        email: d.data().email === "manish@2211" ? "manish@2211" : "manish@2211.com",
        passwordHash: hash,
        role: "ADMIN",
        phone: "+91 73804 92118",
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }

  // Ensure "manish@2211.com" exists
  const qCom = query(usersRef, where("email", "==", "manish@2211.com"));
  const snapCom = await getDocs(qCom);
  if (snapCom.empty) {
    await addDoc(usersRef, {
      name: "Manish Maurya (Admin)",
      email: "manish@2211.com",
      passwordHash: hash,
      role: "ADMIN",
      phone: "+91 73804 92118",
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Created doc for manish@2211.com");
  }

  // Ensure "manish@2211" exists
  const qShort = query(usersRef, where("email", "==", "manish@2211"));
  const snapShort = await getDocs(qShort);
  if (snapShort.empty) {
    await addDoc(usersRef, {
      name: "Manish Maurya (Admin)",
      email: "manish@2211",
      passwordHash: hash,
      role: "ADMIN",
      phone: "+91 73804 92118",
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Created doc for manish@2211");
  }

  console.log("Admin credentials updated successfully in Firestore!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error setting admin credentials:", err);
  process.exit(1);
});

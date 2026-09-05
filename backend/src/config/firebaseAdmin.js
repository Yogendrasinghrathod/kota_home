import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const file = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "firebase-service-account.json"
  );

  if (!existsSync(file)) {
    throw new Error(
      "Set FIREBASE_SERVICE_ACCOUNT env or add src/config/firebase-service-account.json"
    );
  }

  return JSON.parse(readFileSync(file, "utf8"));
};

initializeApp({
  credential: cert(loadServiceAccount()),
});

export const firebaseAuth = getAuth();

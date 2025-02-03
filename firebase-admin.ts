import {
  initializeApp,
  applicationDefault,
  cert,
  getApp,
  getApps,
  App,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

import serviceKey from "@/service_key.json";
import { ServiceAccount } from "firebase-admin";

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceKey as ServiceAccount),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };

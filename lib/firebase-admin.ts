import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

export function getAdminApp(): App {
  if (getApps().find((a) => a.name === 'admin')) {
    return getApps().find((a) => a.name === 'admin')!;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  adminApp = initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    },
    'admin'
  );

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../../facturacionihandler-firebase-adminsdk-cyums-dae553109b.json'), 'utf8'));

const app = initializeApp({ credential: cert(sa) }, 'test-setup');
const auth = getAuth(app);
const db = getFirestore(app);

const TEST_EMAIL    = 'test-owner@i-handler.app';
const TEST_PASSWORD = 'TestOwner2025!';
const COMPANY_NAME  = 'i-Handler Test FBO';
const COMPANY_TYPE  = 'fbo';
const ICAO          = 'KJFK';

async function run() {
  // 1. Create or reset the Firebase Auth user
  let uid;
  try {
    const existing = await auth.getUserByEmail(TEST_EMAIL);
    uid = existing.uid;
    await auth.updateUser(uid, { password: TEST_PASSWORD });
    console.log('✓ Updated existing auth user:', uid);
  } catch {
    const user = await auth.createUser({ email: TEST_EMAIL, password: TEST_PASSWORD, displayName: COMPANY_NAME });
    uid = user.uid;
    console.log('✓ Created new auth user:', uid);
  }

  // 2. Create/overwrite the users/{uid} doc
  await db.collection('users').doc(uid).set({
    email: TEST_EMAIL,
    companyName: COMPANY_NAME,
    companyType: COMPANY_TYPE,
    icao: ICAO,
    role: 'owner',
    status: 'approved',
    createdAt: new Date().toISOString(),
  });
  console.log('✓ users/' + uid + ' doc written');

  // 3. Check if an FBO record already exists for this ICAO + name
  const existing = await db.collection('fbo')
    .where('fboIcao', '==', ICAO)
    .where('fboName', '==', COMPANY_NAME)
    .limit(1).get();

  if (existing.empty) {
    const ref = await db.collection('fbo').add({
      fboName: COMPANY_NAME,
      fboIcao: ICAO,
      fboCity: 'New York',
      fboState: 'NY',
      fboCountry: 'United States',
      fboPhne: '+1 555-000-0000',
      fboEmail: TEST_EMAIL,
      fboWebsite: 'https://www.i-handler.app',
      fboAddress: '1 JFK Airport, Jamaica, NY 11430',
      fboPocName: 'Test Manager',
      fboPocTitle: 'Station Manager',
      fboPocMobile: '+1 555-000-0001',
      fboWhatsapp: '+1 555-000-0001',
      fboRemarks: 'This is a test FBO record for portal development.',
      fboServiceCategories: ['Fuel', 'Ramp', 'Passenger'],
    });
    console.log('✓ Created test FBO record: fbo/' + ref.id);
  } else {
    console.log('✓ FBO record already exists:', existing.docs[0].id);
  }

  console.log('\n─────────────────────────────────────');
  console.log('  TEST LOGIN CREDENTIALS');
  console.log('  Portal:   https://ihandler-landing.vercel.app/login');
  console.log('  Email:    ' + TEST_EMAIL);
  console.log('  Password: ' + TEST_PASSWORD);
  console.log('─────────────────────────────────────\n');
  console.log('  Or test locally at: http://localhost:3000/login\n');

  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

import http from 'http';
import https from 'https';

const TARGET_UID = 'Gx9MLUcFrFRc3OHQFEhGojKIijI3';
const PROJECT_ID = 'nexora-bdd1d';

async function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.get('http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function unlockProRest() {
  console.log('Fetching Service Account Access Token from GCP Metadata...');
  const token = await getAccessToken();
  console.log('Access token retrieved successfully!');

  // Document path
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${TARGET_UID}?updateMask.fieldPaths=isPro&updateMask.fieldPaths=proTestActive&updateMask.fieldPaths=proTestExpiresAt&updateMask.fieldPaths=settings.isPro&updateMask.fieldPaths=settings.proTestActive&updateMask.fieldPaths=settings.proTestExpiresAt&updateMask.fieldPaths=unlockedProAt&updateMask.fieldPaths=subscriptionNote`;

  const payload = {
    fields: {
      isPro: { booleanValue: true },
      proTestActive: { booleanValue: false },
      proTestExpiresAt: { nullValue: null },
      unlockedProAt: { stringValue: new Date().toISOString() },
      subscriptionNote: { stringValue: "1-Week Pro Membership Granted by Admin" },
      settings: {
        mapValue: {
          fields: {
            isPro: { booleanValue: true },
            proTestActive: { booleanValue: false },
            proTestExpiresAt: { nullValue: null }
          }
        }
      }
    }
  };

  console.log(`Sending PATCH request to Firestore REST API for document users/${TARGET_UID}...`);

  const req = https.request(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`HTTP Status: ${res.statusCode}`);
      console.log('Response Body:', body);
      if (res.statusCode === 200) {
        console.log(`\n🎉 SUCCESS! Pro version unlocked for user UID: ${TARGET_UID}`);
      } else {
        console.error(`\n❌ FAILED to update Firestore document. Status ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(JSON.stringify(payload));
  req.end();
}

unlockProRest().catch(console.error);

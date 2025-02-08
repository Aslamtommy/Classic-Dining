import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';  
import path from 'path';

// Define the custom service account interface
interface Serviceaccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

 
const serviceAccount: Serviceaccount = require(
  path.resolve(__dirname, 'serviceAccountKey.json'),
);

// Initialize Firebase Admin SDK with the loaded service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount), 
});

export default admin;

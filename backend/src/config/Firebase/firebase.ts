import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import 'dotenv/config'; // Load environment variables

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
  universe_domain: string;
}

// Load service account credentials from environment variables
const serviceAccount: Serviceaccount = {
  type: process.env.FIREBASE_TYPE!,
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
  private_key:  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ9/3ln/WX6bPx\n6rsEInITU0gfwdh6OZiN2zqEnNXI2Qc6/UVc1hFTs/jtAdlJYFIT91dj2mL16xjF\nTQwosfOVSqcdXIMGMMINw8dLRnZWxPQeUoRE04/rAoIMIecgPAz2NwPAPA/HyJJz\ntFieLai1TdGhagzGKFxDWQwXbHx74POoabCQbJ4tmMct8A10up9D4eR6It4Hu8x5\n0RhJGOVYDZ6y1sHC6kPEIgrkH/RAC+M24aRuDzsDue4bY1pMQsksaKKWB8pFTYui\ndG4ucdVmJzk+aunWSJQZokwpaSoXVPSg+G7BDDrGS4rWFQF7wfXBjJory+yidelI\npv5dsszrAgMBAAECggEAGW9KVeLCFl2DjX2+H//i/uVPe8EzgSO6bQdBf1sLyVml\n8di/INOsBu/v4rw9/kV6nnDU5kaEGL070T4p5o/JZEjnUlJKycyjwFZxqZOJ2Js3\n/1fSrnNfjmVnBoJoRYcsXgjSa7q2frIlgNHxK1gZoTp49VR6NB9ekM9RzWPv7MZ+\nllvaNyvQ1trFlyfThCgwJ0nf9sfUjPB2rfjIWJGz3SfOsGDg1rjyPNQ4J6aE4aGu\nquiXLLpsVPVGyw0B75IKwfLG8274GAG9DLFW1SCyRkMrSIiE7rFFWynw3iAELvw9\nqO8qSShlJ6P6eNJWpeixol6qvswokJuHbClxSZsSGQKBgQDum8lcVcxvx2RUak8f\nj0SLt1HAAJjwig3WdnF6i8q2QEy/00INvx7NgcEFXe+LQ4mei4uilrLslKyTBpSr\nMs5LV8YXQgSA/5+FRWCGErAUPXsJnfZ7k2ODHYtby7WeHsPD+cRkk4TqwveJKOqC\n0lAv2NHVBWp3C+9EHjC0b9CH8wKBgQDp2xXXKmfxYqceZJRFHbE/8Ay+o31ln6f7\nUjVX5hwbjFMHEhNdgxczURwDb7RvNSnEX5LLhHTbuA64SAwpR9GTEiCZAyxkgUEP\n1t0OmxP47fnhRZOp/Ycd/fABp1VfDCcNf5/9PuViMFBnewbclZ2j/y5jjgXCWp6L\nmfA01p+dKQKBgFboCvlEjsePui0840C9b9vrkyz5irrhrZSVY1OdIuIqnUmo6oAT\nQmbbgbAwvJTerns+nEdF2DlvFUQfu3p3cMfkWlQSSY2qjTF/SV7L47IbinrAPAxa\nbH5O/nkawzWqQudYS33OdTUEeiBM9M1dSLOEpziNVm+xux32WQr/RtadAoGBAKo/\nS+wjvB44Is/2ixayIhsZCD41SZIVJDbLx3fhVu8bPkq0dxKp39cFIm7CAMrBGlIS\n/gxZtrVKjrTMBsZ6uXDnToH2lHfqvVHpq275qRWdMkA05eZoYtiLyRF7H6SddUTX\nd8Lm6hmMcMyU/Q7TgTsmCECD4V93l1qsS/o7kWHZAoGAM8+Z+tN/K6J505JwDIbx\nKWPNCJEmv6gh9PgumoCRKjJeStu31rdxKNYzupriPvIx7GRW4YC7PgjKJ9OP1a3U\nIYhuH3Br1+/WoBLuG8OWw6Surg6LNV00H46hvxqKyTnXS8zA+YICXJXK524Uukix\nqspV0zWrMAH23jy+amZlBCc=\n-----END PRIVATE KEY-----\n",

  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID!,
  auth_uri: process.env.FIREBASE_AUTH_URI!,
  token_uri: process.env.FIREBASE_TOKEN_URI!,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN!,
};

// Initialize Firebase Admin SDK with the service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';


const REDIRECT_URI = 'http://localhost';

// ✅ Add this line - it was missing!
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const oauth2Client = new google.auth.OAuth2(

  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('👉 Open this URL:\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('👉 Enter code: ', async (code) => {
  try {
    const decodedCode = decodeURIComponent(code);
    const { tokens } = await oauth2Client.getToken(decodedCode);
    fs.writeFileSync('auth/token.json', JSON.stringify(tokens, null, 2));
    console.log('✅ Token saved!');
    rl.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
});
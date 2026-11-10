import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

const TOKEN_PATH = path.join(process.cwd(), 'auth/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'auth/credentials.json');

//
// 🔐 AUTH CLIENT
//
function getAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('credentials.json not found.');
  }
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('token.json not found. Please generate it first.');
  }

  // ✅ Read CLIENT_ID & SECRET from credentials.json
  const { web } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = web;

  const credentials = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

  const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris?.[0] ?? 'http://localhost'
  );
  auth.setCredentials(credentials);

  // ✅ Auto-save refreshed token back to file
  auth.on('tokens', (tokens) => {
    const existing = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    const updated = { ...existing, ...tokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
    console.log('🔄 Token refreshed and saved');
  });

  return auth;
}

//
// 📧 GMAIL CLIENT
//
function getGmailClient() {
  return google.gmail({
    version: 'v1',
    auth: getAuthClient(),
  });
}

//
// 📩 STEP 1: GET LATEST MESSAGE ID
//
export async function getLatestMessageId(email: string): Promise<string> {
  const gmail = getGmailClient();

  const query = `subject:"Rebode Account Email Verification Code" newer_than:10m`;
  console.log('📧 Gmail Query:', query);

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5,
    q: query,
  });

  console.log('📨 Messages found:', res.data.messages?.length || 0);

  if (!res.data.messages || res.data.messages.length === 0) {
    throw new Error('No OTP emails found');
  }

  // ✅ Fetch full message details and sort by latest
  const detailedMessages = await Promise.all(
    res.data.messages.map(msg =>
      gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
      })
    )
  );

  detailedMessages.sort(
    (a, b) => Number(b.data.internalDate) - Number(a.data.internalDate)
  );

  return detailedMessages[0].data.id!;
}

//
// 📄 STEP 2: GET EMAIL BODY
//
export async function getEmailBody(messageId: string): Promise<string> {
  const gmail = getGmailClient();

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const payload = res.data.payload;

  if (!payload) {
    throw new Error('Email payload is empty');
  }

  // ✅ Case 1: Simple email
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // ✅ Case 2: Multipart email (recursive)
  function extractParts(parts: any[]): string {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) {
        const result = extractParts(part.parts);
        if (result) return result;
      }
    }
    return '';
  }

  if (payload.parts && payload.parts.length > 0) {
    const body = extractParts(payload.parts);
    if (body) return body;
  }

  throw new Error('No email body found');
}

//
// 🔢 STEP 3: EXTRACT OTP
//
export function extractOTP(emailBody: string): string {
  const match = emailBody.match(/\b\d{6}\b/);
  if (!match) {
    throw new Error('OTP not found in email');
  }
  return match[0];
}

//
// 🔁 STEP 4: FETCH OTP WITH RETRY
//
export async function getOtpWithRetry(
  email: string,
  retries = 3,
  delayMs = 7000
): Promise<string> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempt ${i + 1} to fetch OTP...`);

      const messageId = await getLatestMessageId(email);
      console.log('📨 Message ID:', messageId);

      const emailBody = await getEmailBody(messageId);
      const otp = extractOTP(emailBody);

      console.log('✅ OTP fetched:', otp);
      return otp;
    } catch (err: any) {
      lastError = err;
      console.log(`⏳ Retry ${i + 1} failed: ${err.message}`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  throw new Error(`❌ Failed to retrieve OTP. Last error: ${lastError?.message}`);
}
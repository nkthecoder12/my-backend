const { google } = require("googleapis");
const path = require("path");

async function getAuthClient() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.resolve(__dirname, "../credentials.json");

  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } catch (err) {
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } else {
      throw err;
    }
  }
  return auth;
}

async function appendEnrollmentRow({ name, email, phone, course, price, paymentId, status }) {
const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim(); 
if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID not set");

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const values = [[name, email, phone, course || "", `₹${price || ""}`, paymentId || "", status]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  } catch (error) {
    console.error("Google Sheets append error:", error);
    throw new Error(`Failed to append to Google Sheets: ${error.message}`);
  }
}

module.exports = { appendEnrollmentRow };

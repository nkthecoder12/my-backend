# Cyber Guardians Backend

Standalone Node.js backend for the Cyber Guardians enrollment system with Razorpay payments and Google Sheets integration.

## Features

- ✅ Razorpay payment processing
- ✅ Google Sheets integration
- ✅ WhatsApp notifications (Twilio)
- ✅ MongoDB database
- ✅ Express.js API
- ✅ CORS enabled
- ✅ Webhook handling

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

## Environment Variables

Copy `env.example` to `.env` and fill in your values:

- `MONGO_URI` - MongoDB connection string
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook secret
- `GOOGLE_SHEET_ID` - Google Sheets ID
- `GOOGLE_CREDENTIALS_JSON` - Google service account JSON (or use credentials.json file)
- `TWILIO_*` - Twilio credentials for WhatsApp (optional)

## API Endpoints

- `POST /api/enroll` - Create payment order
- `POST /api/verify-payment` - Verify payment
- `POST /api/webhook` - Razorpay webhook
- `GET /api/health` - Health check

## Deployment to Render

1. Push this code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy!

The `render.yaml` file is included for easy deployment configuration.

## Migration from Firebase Functions

This backend was migrated from Firebase Functions. All Firebase-specific code has been removed and replaced with standard Express.js patterns.

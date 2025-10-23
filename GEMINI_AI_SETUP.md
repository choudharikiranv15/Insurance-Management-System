# Gemini AI Chatbot Integration - Setup Guide

## Overview
Your ClaimEase chatbot is now powered by **Google Gemini AI**, providing intelligent, context-aware responses to insurance-related queries. The chatbot is restricted to only answer insurance-related questions using a comprehensive system prompt.

---

## Features

### 🤖 Intelligent Responses
- Natural language understanding
- Context-aware conversations
- Personalized responses based on user data

### 🛡️ Restricted to Insurance Domain
The chatbot ONLY answers questions about:
- Insurance policies (Life, Health, Auto, Home, Travel, Business)
- Claims process and status
- Premium payments and billing
- Policy recommendations
- Coverage details
- Insurance terms and concepts
- ClaimEase platform features

### ❌ Non-Insurance Questions
For non-insurance questions, the chatbot politely declines and redirects users back to insurance topics.

---

## Setup Instructions

### Step 1: Get Your Free Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://ai.google.dev/

2. **Sign in with Google Account**
   - Use your existing Google account
   - Accept the terms of service

3. **Create API Key**
   - Click on "Get API Key" or "Create API Key"
   - Click "Create API key in new project" (recommended)
   - Copy the generated API key

4. **Important**: Keep your API key secure and never commit it to version control

### Step 2: Add API Key to Environment Variables

1. **Open backend/.env file**
   ```bash
   cd backend
   nano .env   # or use your preferred text editor
   ```

2. **Find the GEMINI_API_KEY line** (around line 46):
   ```env
   # AI Configuration - Gemini API for Chatbot
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Replace with your actual API key**:
   ```env
   # AI Configuration - Gemini API for Chatbot
   GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Save the file**

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

The chatbot will now use Gemini AI for intelligent responses!

---

## Testing the Chatbot

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend_backup
npm start
```

### 2. Login to the Application
- Navigate to http://localhost:3000
- Login with any user credentials
- Look for the chatbot icon in the bottom-right corner

### 3. Test Insurance Questions ✅

**Try these questions:**
- "What types of insurance do you offer?"
- "How can I file a claim?"
- "Tell me about life insurance"
- "What is the premium for health insurance?"
- "Show my policies"
- "Check my claim status"
- "When is my next payment due?"
- "Explain coverage options"

### 4. Test Non-Insurance Questions ❌

**Try these (should be declined):**
- "What's the weather today?"
- "Tell me a joke"
- "Who won the World Cup?"
- "How to cook pasta?"

**Expected Response:**
> "I'm specialized in insurance assistance. I can help you with insurance policies, claims, payments, or coverage details. How can I assist you with your insurance needs?"

---

## System Prompt Configuration

The chatbot uses a comprehensive system prompt that:

1. ✅ **Allows** insurance-related topics only
2. ❌ **Blocks** general knowledge, entertainment, weather, cooking, etc.
3. 📋 **Provides** accurate ClaimEase information
4. 🎯 **Maintains** professional, helpful tone
5. 📊 **Uses** user context (name, policies, claims)

### System Prompt Location
`backend/src/services/geminiService.js` - Line 6-66

You can customize the system prompt to add more specific instructions or information about your insurance products.

---

## API Usage & Limits

### Free Tier (Gemini API)
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

Perfect for development and testing!

### For Production
- Consider upgrading to paid tier for higher limits
- Monitor usage at: https://makersuite.google.com/app/apikey

---

## Fallback Mechanism

If Gemini API is unavailable or not configured:
- ✅ Chatbot automatically falls back to keyword-based responses
- ✅ Users still get basic assistance
- ⚠️ Check console for error messages

---

## Troubleshooting

### Issue: "GEMINI_API_KEY not configured" warning

**Solution:**
1. Verify `.env` file has the correct API key
2. Restart backend server
3. Check for typos in the key

### Issue: "Rate limit exceeded"

**Solution:**
1. Free tier has 60 requests/minute limit
2. Wait a minute and try again
3. Consider upgrading API plan

### Issue: Chatbot not responding

**Solution:**
1. Check backend server logs for errors
2. Verify MongoDB is running
3. Check network connectivity
4. Verify API key is valid

### Issue: Non-insurance questions being answered

**Solution:**
1. Review system prompt in `geminiService.js`
2. Make restrictions more explicit
3. Add more example redirections

---

## Advanced Customization

### Update System Prompt

Edit `backend/src/services/geminiService.js`:

```javascript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

### Add New Insurance Products

Update the system prompt with new product information:

```javascript
5. Key Information:
   - New Product: Description and pricing
   - ...
```

### Modify Fallback Responses

Edit `getFallbackResponse()` function in `geminiService.js`

---

## Security Best Practices

1. ✅ **Never** commit API keys to Git
2. ✅ **Use** environment variables
3. ✅ **Rotate** API keys periodically
4. ✅ **Monitor** API usage
5. ✅ **Set** usage alerts in Google AI Studio

---

## Support

### Gemini AI Documentation
- https://ai.google.dev/docs
- https://ai.google.dev/tutorials/node_quickstart

### Need Help?
- Check backend server logs
- Review console errors
- Contact support at: support@claimease.com

---

## Summary

✅ **Installed**: `@google/generative-ai` package
✅ **Created**: `geminiService.js` with system prompt
✅ **Updated**: `chatbotController.js` to use Gemini
✅ **Configured**: Environment variable for API key
✅ **Added**: Fallback mechanism for reliability

**Next Step**: Get your Gemini API key and start testing! 🚀

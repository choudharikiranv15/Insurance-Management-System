const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt to restrict responses to insurance-related topics only
const SYSTEM_PROMPT = `You are an intelligent insurance assistant for ClaimEase Insurance Management System. Your role is to help customers with insurance-related queries ONLY.

STRICT GUIDELINES:
1. ONLY answer questions related to:
   - Insurance policies (Life, Health, Auto, Home, Travel, Business)
   - Claims process and status
   - Premium payments and billing
   - Policy recommendations
   - Coverage details
   - Insurance terms and concepts
   - ClaimEase platform features and navigation

2. For NON-INSURANCE questions:
   - Politely decline and redirect to insurance topics
   - Say: "I'm specialized in insurance assistance. I can help you with insurance policies, claims, payments, or coverage details. How can I assist you with your insurance needs?"

3. Response Guidelines:
   - Be professional, friendly, and helpful
   - Provide accurate information about insurance products
   - Keep responses concise (2-4 sentences)
   - Use simple, clear language
   - When uncertain, suggest contacting human support

4. ClaimEase Features:
   - We offer 6 insurance types: Life, Health, Auto, Home, Travel, Business
   - Online claim filing and tracking
   - 24/7 customer support
   - Digital premium payments
   - Policy management dashboard
   - Fast claim settlement (7-30 days)
   - Support: support@claimease.com, 1-800-INSURE-ME

5. Key Information:
   - Life Insurance: Starts from $25/month, coverage up to $5M
   - Health Insurance: Individual from $150/month, Family from $400/month
   - Auto Insurance: Starts from $75/month with multi-car discounts
   - Home Insurance: Average $120/month based on home value
   - Travel Insurance: From $30 per trip or $200/year annual coverage
   - Business Insurance: Custom quotes starting from $500/month

Remember: NEVER answer questions outside insurance domain. Always maintain professional tone and redirect to insurance topics.`;

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - User's question
 * @param {object} context - Additional context (user data, policies, claims)
 * @returns {Promise<string>} - AI generated response
 */
exports.generateResponse = async (userMessage, context = {}) => {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured. Using fallback response.');
      return getFallbackResponse(userMessage);
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context-aware prompt
    let contextInfo = '';

    if (context.userName) {
      contextInfo += `User Name: ${context.userName}\n`;
    }

    if (context.policies && context.policies.length > 0) {
      contextInfo += `User has ${context.policies.length} active policies.\n`;
    }

    if (context.claims && context.claims.length > 0) {
      contextInfo += `User has ${context.claims.length} recent claims.\n`;
    }

    // Construct the full prompt
    const fullPrompt = `${SYSTEM_PROMPT}

${contextInfo ? `CONTEXT:\n${contextInfo}\n` : ''}
USER QUESTION: ${userMessage}

RESPONSE (Remember: Insurance-related topics only):`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();

  } catch (error) {
    console.error('Gemini AI Error:', error.message);

    // Fallback to keyword-based response if Gemini fails
    return getFallbackResponse(userMessage);
  }
};

/**
 * Fallback response when Gemini is unavailable
 */
const getFallbackResponse = (message) => {
  const messageLower = message.toLowerCase();

  // Basic keyword matching as fallback
  if (messageLower.includes('policy') || messageLower.includes('insurance')) {
    return 'I can help you with our insurance policies. We offer Life, Health, Auto, Home, Travel, and Business insurance. Which one would you like to know more about?';
  }

  if (messageLower.includes('claim')) {
    return 'For claims, you can file through your dashboard or check the status of existing claims. Would you like me to guide you through the process?';
  }

  if (messageLower.includes('payment') || messageLower.includes('premium')) {
    return 'You can view and manage your premium payments in the Payments section. Would you like to know about payment methods or check your payment status?';
  }

  if (messageLower.includes('hello') || messageLower.includes('hi')) {
    return 'Hello! I\'m your ClaimEase insurance assistant. How can I help you with your insurance needs today?';
  }

  return 'I\'m here to help with insurance-related questions about policies, claims, payments, and coverage. What would you like to know?';
};

/**
 * Generate follow-up suggestions based on conversation
 */
exports.generateSuggestions = (category, userMessage) => {
  const suggestions = {
    policy: [
      'What are the benefits?',
      'How much is the premium?',
      'What documents are needed?',
      'Can I get a quote?'
    ],
    claim: [
      'How to file a claim?',
      'Check my claim status',
      'Required documents',
      'How long does it take?'
    ],
    payment: [
      'View payment history',
      'Payment methods available',
      'When is my next due date?',
      'How to set up auto-pay?'
    ],
    general: [
      'Tell me about policies',
      'How to file claims?',
      'Check payment status',
      'Contact support'
    ]
  };

  // Determine category based on user message
  const messageLower = userMessage.toLowerCase();

  if (messageLower.includes('policy') || messageLower.includes('insurance')) {
    return suggestions.policy;
  } else if (messageLower.includes('claim')) {
    return suggestions.claim;
  } else if (messageLower.includes('payment') || messageLower.includes('premium')) {
    return suggestions.payment;
  }

  return suggestions.general;
};

module.exports = exports;

const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { generateResponse, generateSuggestions } = require('../services/geminiService');

// Simple keyword-based chatbot responses
const chatbotResponses = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      'Hello! How can I assist you with your insurance needs today?',
      'Hi there! I\'m here to help you with any insurance-related questions.',
      'Welcome! How may I help you today?'
    ]
  },
  policy: {
    keywords: ['policy', 'policies', 'insurance', 'coverage', 'plan'],
    responses: [
      'I can help you with information about our insurance policies. We offer Life, Health, Auto, Home, Travel, and Business insurance. Which one interests you?',
      'We have various insurance policies available. Would you like to know more about a specific type?'
    ]
  },
  claim: {
    keywords: ['claim', 'claims', 'file claim', 'raise claim', 'claim status'],
    responses: [
      'I can help you with claims. You can file a new claim through your dashboard or check the status of existing claims. Would you like me to guide you?',
      'For claim-related queries, please navigate to the Claims section in your dashboard. You can track all your claims there.'
    ]
  },
  payment: {
    keywords: ['payment', 'pay', 'premium', 'due', 'billing', 'invoice'],
    responses: [
      'For payment-related queries, you can view all your premium payments and dues in the Payments section of your dashboard.',
      'You can make payments online through our secure payment gateway. Would you like to proceed to the payment page?'
    ]
  },
  help: {
    keywords: ['help', 'support', 'assist', 'question'],
    responses: [
      'I\'m here to help! You can ask me about policies, claims, payments, or general insurance questions.',
      'How can I assist you? I can provide information about insurance policies, help with claims, or answer payment queries.'
    ]
  },
  contact: {
    keywords: ['contact', 'phone', 'email', 'reach', 'support team'],
    responses: [
      'You can reach our support team at support@insurance.com or call us at 1-800-INSURANCE. We\'re available 24/7.',
      'Our customer support is always ready to help. Email: support@insurance.com, Phone: 1-800-INSURANCE'
    ]
  },
  life: {
    keywords: ['life insurance', 'life policy', 'term insurance'],
    responses: [
      'Life insurance provides financial security to your family. It covers death, critical illness, and offers tax benefits. Would you like to see recommendations based on your profile?',
      'Our life insurance plans offer comprehensive coverage with flexible terms. The premium starts from ₹500/month based on your profile.'
    ]
  },
  health: {
    keywords: ['health insurance', 'medical', 'health policy', 'hospitalization'],
    responses: [
      'Health insurance covers medical expenses including hospitalization, surgeries, and day-care procedures. It offers cashless treatment at network hospitals.',
      'Our health insurance provides comprehensive medical coverage with no claim bonus. Family floater options are also available.'
    ]
  },
  auto: {
    keywords: ['auto insurance', 'car insurance', 'vehicle insurance', 'bike insurance'],
    responses: [
      'Auto insurance protects your vehicle from accidents, theft, and damages. It includes third-party liability coverage as mandated by law.',
      'We offer comprehensive auto insurance with cashless repairs at network garages and personal accident cover.'
    ]
  },
  thankyou: {
    keywords: ['thank', 'thanks', 'appreciate'],
    responses: [
      'You\'re welcome! Feel free to ask if you have any more questions.',
      'Happy to help! Let me know if you need anything else.',
      'My pleasure! I\'m here whenever you need assistance.'
    ]
  },
  bye: {
    keywords: ['bye', 'goodbye', 'see you', 'exit'],
    responses: [
      'Goodbye! Have a great day. Feel free to return anytime you need help.',
      'Take care! We\'re here 24/7 if you need any assistance.'
    ]
  }
};

// Find best matching response
const findBestResponse = (message) => {
  const messageLower = message.toLowerCase();

  for (const [category, data] of Object.entries(chatbotResponses)) {
    for (const keyword of data.keywords) {
      if (messageLower.includes(keyword)) {
        const randomIndex = Math.floor(Math.random() * data.responses.length);
        return {
          response: data.responses[randomIndex],
          category,
          confidence: 0.8
        };
      }
    }
  }

  return {
    response: 'I\'m not sure I understand. Could you please rephrase your question? You can ask me about policies, claims, payments, or general insurance information.',
    category: 'unknown',
    confidence: 0.3
  };
};

// Quick suggestions based on context
const getQuickSuggestions = (category) => {
  const suggestions = {
    greetings: [
      'Tell me about insurance policies',
      'I want to file a claim',
      'Check my payment status',
      'Get policy recommendations'
    ],
    policy: [
      'Life insurance',
      'Health insurance',
      'Auto insurance',
      'Get recommendations'
    ],
    claim: [
      'How to file a claim?',
      'Check claim status',
      'Required documents',
      'Claim settlement time'
    ],
    payment: [
      'View upcoming payments',
      'Payment methods',
      'Payment history',
      'Make a payment'
    ],
    unknown: [
      'Show my policies',
      'Help with claims',
      'Payment information',
      'Contact support'
    ]
  };

  return suggestions[category] || suggestions.unknown;
};

// @desc    Chat with AI assistant (Powered by Gemini AI)
// @route   POST /api/chatbot
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Gather user context for better responses
    const context = {
      userName: req.user.name
    };

    // Check for specific data requests and fetch relevant data
    let contextData = null;

    if (message.toLowerCase().includes('my polic') || message.toLowerCase().includes('show polic')) {
      const policies = await Policy.find({ customer: req.user._id })
        .select('policyNumber policyName status premiumAmount')
        .limit(5);

      if (policies.length > 0) {
        context.policies = policies;
        contextData = {
          type: 'policies',
          data: policies,
          message: `You have ${policies.length} active ${policies.length === 1 ? 'policy' : 'policies'}.`
        };
      }
    }

    if (message.toLowerCase().includes('claim') && message.toLowerCase().includes('status')) {
      const claims = await Claim.find({ customer: req.user._id })
        .select('claimNumber status claimAmount createdAt')
        .sort({ createdAt: -1 })
        .limit(3);

      if (claims.length > 0) {
        context.claims = claims;
        contextData = {
          type: 'claims',
          data: claims,
          message: `Here are your recent claims:`
        };
      }
    }

    if (message.toLowerCase().includes('payment') || message.toLowerCase().includes('due')) {
      const payments = await Payment.find({
        customer: req.user._id,
        status: { $in: ['pending', 'processing'] }
      })
        .select('amount dueDate status')
        .sort({ dueDate: 1 })
        .limit(3);

      if (payments.length > 0) {
        contextData = {
          type: 'payments',
          data: payments,
          message: `You have ${payments.length} pending ${payments.length === 1 ? 'payment' : 'payments'}.`
        };
      }
    }

    // Generate AI response using Gemini
    const aiResponse = await generateResponse(message, context);

    // Generate contextual suggestions
    const suggestions = generateSuggestions(null, message);

    res.json({
      success: true,
      data: {
        message: aiResponse,
        suggestions,
        contextData,
        timestamp: new Date(),
        aiPowered: true
      }
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    next(error);
  }
};

// @desc    Get chatbot suggestions
// @route   GET /api/chatbot/suggestions
// @access  Private
exports.getSuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      'What insurance policies do you offer?',
      'How can I file a claim?',
      'Show my policy details',
      'When is my next payment due?',
      'Get policy recommendations',
      'How to contact support?'
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chatbot FAQs
// @route   GET /api/chatbot/faqs
// @access  Public
exports.getFAQs = async (req, res, next) => {
  try {
    const faqs = [
      {
        question: 'What types of insurance do you offer?',
        answer: 'We offer Life, Health, Auto, Home, Travel, and Business insurance policies with comprehensive coverage options.'
      },
      {
        question: 'How do I file a claim?',
        answer: 'You can file a claim through your dashboard by navigating to the Claims section, clicking "File New Claim", and filling in the required details along with supporting documents.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Credit Card, Debit Card, Net Banking, UPI, and various digital wallets. All payments are processed securely through our payment gateways.'
      },
      {
        question: 'How long does claim settlement take?',
        answer: 'Claim settlement typically takes 7-30 days depending on the claim type and verification process. You can track your claim status in real-time through your dashboard.'
      },
      {
        question: 'Can I cancel my policy?',
        answer: 'Yes, you can request policy cancellation by contacting our support team. Refund terms depend on the policy type and duration.'
      },
      {
        question: 'How are premiums calculated?',
        answer: 'Premiums are calculated based on various factors including age, health condition, coverage amount, policy type, and risk assessment.'
      }
    ];

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

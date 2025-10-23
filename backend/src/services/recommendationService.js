const Profile = require('../models/Profile');
const Policy = require('../models/Policy');
const User = require('../models/User');

// Policy type definitions with criteria
const policyTypes = {
  life: {
    name: 'Life Insurance',
    description: 'Provides financial security to your family in case of unfortunate events',
    basePremiumRate: 0.05,
    factors: {
      age: { weight: 0.3, ranges: [[18, 30, 1.0], [31, 45, 1.2], [46, 60, 1.5], [61, 100, 2.0]] },
      income: { weight: 0.2, ranges: [[0, 300000, 0.8], [300001, 600000, 1.0], [600001, 1200000, 1.3], [1200001, Infinity, 1.5]] },
      smoker: { weight: 0.25, isSmoker: 1.5, nonSmoker: 1.0 },
      familyHistory: { weight: 0.15, hasHistory: 1.3, noHistory: 1.0 },
      maritalStatus: { weight: 0.1, married: 1.2, single: 1.0 }
    }
  },
  health: {
    name: 'Health Insurance',
    description: 'Comprehensive medical coverage for you and your family',
    basePremiumRate: 0.04,
    factors: {
      age: { weight: 0.25, ranges: [[18, 30, 1.0], [31, 45, 1.3], [46, 60, 1.7], [61, 100, 2.2]] },
      bmi: { weight: 0.2, ranges: [[0, 18.5, 1.2], [18.5, 25, 1.0], [25, 30, 1.4], [30, 100, 1.8]] },
      smoker: { weight: 0.2, isSmoker: 1.6, nonSmoker: 1.0 },
      chronicConditions: { weight: 0.25, hasConditions: 1.5, noConditions: 1.0 },
      familySize: { weight: 0.1, ranges: [[1, 1, 1.0], [2, 2, 1.5], [3, 4, 2.0], [5, 10, 2.5]] }
    }
  },
  auto: {
    name: 'Auto Insurance',
    description: 'Protect your vehicle from accidents, theft, and damages',
    basePremiumRate: 0.03,
    factors: {
      age: { weight: 0.2, ranges: [[18, 25, 1.5], [26, 40, 1.0], [41, 60, 1.1], [61, 100, 1.3]] },
      income: { weight: 0.15, ranges: [[0, 300000, 0.9], [300001, 600000, 1.0], [600001, Infinity, 1.2]] },
      occupation: { weight: 0.1, risky: 1.3, safe: 1.0 },
      location: { weight: 0.15, urban: 1.3, rural: 1.0 }
    }
  },
  home: {
    name: 'Home Insurance',
    description: 'Secure your home and belongings against unforeseen damages',
    basePremiumRate: 0.035,
    factors: {
      income: { weight: 0.25, ranges: [[0, 500000, 0.8], [500001, 1000000, 1.0], [1000001, Infinity, 1.3]] },
      maritalStatus: { weight: 0.15, married: 1.2, single: 1.0 },
      location: { weight: 0.2, urban: 1.2, rural: 1.0 },
      familySize: { weight: 0.1, ranges: [[1, 2, 1.0], [3, 4, 1.3], [5, 10, 1.5]] }
    }
  },
  travel: {
    name: 'Travel Insurance',
    description: 'Travel worry-free with comprehensive coverage abroad',
    basePremiumRate: 0.02,
    factors: {
      age: { weight: 0.2, ranges: [[18, 40, 1.0], [41, 60, 1.2], [61, 100, 1.5]] },
      income: { weight: 0.3, ranges: [[0, 500000, 0.7], [500001, 1000000, 1.0], [1000001, Infinity, 1.4]] },
      chronicConditions: { weight: 0.15, hasConditions: 1.4, noConditions: 1.0 }
    }
  },
  business: {
    name: 'Business Insurance',
    description: 'Protect your business from various risks and liabilities',
    basePremiumRate: 0.045,
    factors: {
      occupation: { weight: 0.4, business: 1.5, employee: 0.8 },
      income: { weight: 0.35, ranges: [[0, 600000, 0.7], [600001, 1200000, 1.0], [1200001, Infinity, 1.5]] },
      age: { weight: 0.15, ranges: [[18, 35, 1.0], [36, 50, 1.2], [51, 100, 1.4]] }
    }
  }
};

// Calculate recommendation score for a policy type
const calculateScore = (policyType, profile, userAge) => {
  const policyDef = policyTypes[policyType];
  if (!policyDef) return 0;

  let score = 100;
  const factors = policyDef.factors;

  // Age factor
  if (factors.age && userAge) {
    const ageRange = factors.age.ranges.find(r => userAge >= r[0] && userAge <= r[1]);
    if (ageRange) {
      score -= (ageRange[2] - 1.0) * 20 * factors.age.weight;
    }
  }

  // Income factor
  if (factors.income && profile.personalInfo?.annualIncome) {
    const income = profile.personalInfo.annualIncome;
    const incomeRange = factors.income.ranges.find(r => income >= r[0] && income <= r[1]);
    if (incomeRange) {
      score += (incomeRange[2] - 1.0) * 15 * factors.income.weight;
    }
  }

  // BMI factor (for health insurance)
  if (factors.bmi && profile.medicalInfo?.height && profile.medicalInfo?.weight) {
    const bmi = profile.medicalInfo.weight / Math.pow(profile.medicalInfo.height / 100, 2);
    const bmiRange = factors.bmi.ranges.find(r => bmi >= r[0] && bmi <= r[1]);
    if (bmiRange) {
      score -= (bmiRange[2] - 1.0) * 15 * factors.bmi.weight;
    }
  }

  // Smoker factor
  if (factors.smoker) {
    const isSmoker = profile.medicalInfo?.smokingStatus === 'yes' || profile.medicalInfo?.smokingStatus === 'occasional';
    const multiplier = isSmoker ? factors.smoker.isSmoker : factors.smoker.nonSmoker;
    score -= (multiplier - 1.0) * 20 * factors.smoker.weight;
  }

  // Chronic conditions factor
  if (factors.chronicConditions) {
    const hasConditions = profile.medicalInfo?.chronicConditions?.length > 0;
    const multiplier = hasConditions ? factors.chronicConditions.hasConditions : factors.chronicConditions.noConditions;
    score -= (multiplier - 1.0) * 18 * factors.chronicConditions.weight;
  }

  // Family history factor
  if (factors.familyHistory) {
    const hasHistory = profile.medicalInfo?.familyMedicalHistory?.length > 0;
    const multiplier = hasHistory ? factors.familyHistory.hasHistory : factors.familyHistory.noHistory;
    score -= (multiplier - 1.0) * 12 * factors.familyHistory.weight;
  }

  // Marital status factor
  if (factors.maritalStatus && profile.personalInfo?.maritalStatus) {
    const isMarried = profile.personalInfo.maritalStatus === 'married';
    const multiplier = isMarried ? factors.maritalStatus.married : factors.maritalStatus.single;
    score += (multiplier - 1.0) * 10 * factors.maritalStatus.weight;
  }

  // Family size factor
  if (factors.familySize && profile.personalInfo?.dependents !== undefined) {
    const familySize = profile.personalInfo.dependents + 1;
    const sizeRange = factors.familySize.ranges.find(r => familySize >= r[0] && familySize <= r[1]);
    if (sizeRange) {
      score += (sizeRange[2] - 1.0) * 12 * factors.familySize.weight;
    }
  }

  // Occupation factor
  if (factors.occupation && profile.workInfo?.employmentType) {
    const isBusiness = profile.workInfo.employmentType === 'self-employed' || profile.workInfo.employmentType === 'business';
    const multiplier = isBusiness ? factors.occupation.business : factors.occupation.employee;
    score += (multiplier - 1.0) * 15 * factors.occupation.weight;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Calculate estimated premium
const calculateEstimatedPremium = (policyType, profile, userAge, coverageAmount = 500000) => {
  const policyDef = policyTypes[policyType];
  if (!policyDef) return 0;

  let multiplier = 1.0;

  // Apply all risk factors
  const factors = policyDef.factors;

  if (factors.age && userAge) {
    const ageRange = factors.age.ranges.find(r => userAge >= r[0] && userAge <= r[1]);
    if (ageRange) multiplier *= ageRange[2];
  }

  if (factors.income && profile.personalInfo?.annualIncome) {
    const income = profile.personalInfo.annualIncome;
    const incomeRange = factors.income.ranges.find(r => income >= r[0] && income <= r[1]);
    if (incomeRange) multiplier *= incomeRange[2];
  }

  if (factors.smoker) {
    const isSmoker = profile.medicalInfo?.smokingStatus === 'yes' || profile.medicalInfo?.smokingStatus === 'occasional';
    multiplier *= isSmoker ? factors.smoker.isSmoker : factors.smoker.nonSmoker;
  }

  if (factors.chronicConditions) {
    const hasConditions = profile.medicalInfo?.chronicConditions?.length > 0;
    multiplier *= hasConditions ? factors.chronicConditions.hasConditions : factors.chronicConditions.noConditions;
  }

  const basePremium = coverageAmount * policyDef.basePremiumRate;
  return Math.round(basePremium * multiplier);
};

// Get smart recommendations for a user
const getRecommendations = async (userId) => {
  try {
    // Get user profile
    const profile = await Profile.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!profile || !user) {
      throw new Error('User or profile not found');
    }

    // Calculate user age
    const userAge = profile.age || 30; // Use virtual or default

    // Get existing policies
    const existingPolicies = await Policy.find({ customer: userId, status: 'active' });
    const existingPolicyTypes = existingPolicies.map(p => p.policyType);

    // Calculate recommendations for all policy types
    const recommendations = [];

    for (const [policyType, policyDef] of Object.entries(policyTypes)) {
      const hasPolicy = existingPolicyTypes.includes(policyType);
      const score = calculateScore(policyType, profile, userAge);
      const estimatedPremium = calculateEstimatedPremium(policyType, profile, userAge);

      // Determine recommendation reasons
      const reasons = [];

      if (policyType === 'life') {
        if (profile.personalInfo?.maritalStatus === 'married') reasons.push('You have family responsibilities');
        if (profile.personalInfo?.dependents > 0) reasons.push(`You have ${profile.personalInfo.dependents} dependent(s)`);
        if (!hasPolicy && score > 70) reasons.push('Highly recommended based on your profile');
      }

      if (policyType === 'health') {
        if (profile.medicalInfo?.chronicConditions?.length > 0) reasons.push('You have pre-existing conditions');
        if (userAge > 30) reasons.push('Health coverage becomes more important with age');
        if (!hasPolicy) reasons.push('Essential coverage for medical emergencies');
      }

      if (policyType === 'auto') {
        // Would check if user has vehicle info
        reasons.push('Protect your vehicle investment');
        if (profile.personalInfo?.annualIncome > 500000) reasons.push('Your income level supports this coverage');
      }

      if (policyType === 'home') {
        if (profile.personalInfo?.maritalStatus === 'married') reasons.push('Secure your family home');
        if (profile.personalInfo?.annualIncome > 600000) reasons.push('Your income supports homeownership');
      }

      if (policyType === 'travel') {
        if (profile.personalInfo?.annualIncome > 800000) reasons.push('Your lifestyle may include frequent travel');
        reasons.push('Essential for international trips');
      }

      if (policyType === 'business') {
        if (profile.workInfo?.employmentType === 'self-employed' || profile.workInfo?.employmentType === 'business') {
          reasons.push('You are self-employed/business owner');
          reasons.push('Protect your business assets');
        }
      }

      recommendations.push({
        policyType,
        name: policyDef.name,
        description: policyDef.description,
        score: Math.round(score),
        priority: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low',
        hasExisting: hasPolicy,
        estimatedPremium: {
          monthly: Math.round(estimatedPremium / 12),
          annual: estimatedPremium
        },
        recommendedCoverage: policyType === 'life' ?
          Math.round(profile.personalInfo?.annualIncome * 10 || 1000000) :
          policyType === 'health' ? 500000 : 300000,
        reasons,
        benefits: getBenefits(policyType)
      });
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);

    return {
      recommendations,
      profileCompleteness: profile.profileCompleteness || 0,
      userInfo: {
        name: `${user.firstName} ${user.lastName}`,
        age: userAge,
        occupation: profile.workInfo?.occupation || 'Not specified',
        income: profile.personalInfo?.annualIncome || 0
      }
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

// Get benefits for a policy type
const getBenefits = (policyType) => {
  const benefits = {
    life: [
      'Financial security for family',
      'Coverage for critical illnesses',
      'Tax benefits under Section 80C',
      'Maturity benefits'
    ],
    health: [
      'Cashless hospitalization',
      'Coverage for pre and post hospitalization',
      'Day-care procedures covered',
      'Tax benefits under Section 80D',
      'No claim bonus'
    ],
    auto: [
      'Coverage for accidents',
      'Third-party liability protection',
      'Personal accident cover',
      'Theft and fire protection',
      'Cashless repairs at network garages'
    ],
    home: [
      'Coverage for building structure',
      'Protection for household items',
      'Coverage for natural calamities',
      'Temporary accommodation expenses',
      'Personal liability coverage'
    ],
    travel: [
      'Medical emergency coverage abroad',
      'Trip cancellation protection',
      'Lost baggage compensation',
      'Flight delay coverage',
      'Emergency evacuation'
    ],
    business: [
      'Property damage coverage',
      'Business interruption insurance',
      'Liability coverage',
      'Equipment protection',
      'Employee coverage options'
    ]
  };

  return benefits[policyType] || [];
};

module.exports = {
  getRecommendations,
  calculateScore,
  calculateEstimatedPremium,
  policyTypes
};

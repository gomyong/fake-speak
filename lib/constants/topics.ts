// lib/constants/topics.ts

export interface TopicDomain {
  id: string;
  name: string;
  nameKo: string;
  subTopics: {
    id: string;
    title: string;
    description: string;
    cognitiveQuestions: {
      level1: string; // Descriptive (Band 5.5 - 6.0)
      level2: string; // Comparative & Analytical (Band 6.5 - 7.0)
      level3: string; // Counterfactual & Speculative (Band 7.5 - 9.0)
    };
  }[];
}

export const TOPIC_DOMAINS: TopicDomain[] = [
  {
    id: 'environment',
    name: 'Environment & Sustainability',
    nameKo: '환경 & 지속가능성',
    subTopics: [
      {
        id: 'climate_policy',
        title: 'Climate Policy & Energy Transition',
        description: 'Renewable energy, carbon neutrality, and government legislation.',
        cognitiveQuestions: {
          level1: 'Describe an environmental initiative in your local community or city.',
          level2: 'How do economic incentives compare with strict government mandates in reducing industrial carbon emissions?',
          level3: 'Were developed nations to impose severe carbon tariffs on developing economies, how might that reshape global geopolitical alliances?'
        }
      },
      {
        id: 'circular_economy',
        title: 'Circular Economy & Waste Reduction',
        description: 'Zero waste, recycling infrastructures, and product lifecycles.',
        cognitiveQuestions: {
          level1: 'Talk about how waste and recycling are currently handled in your neighborhood.',
          level2: 'Why is transitioning to a circular economy more challenging for manufacturing industries than service sectors?',
          level3: 'If planned obsolescence were legally classified as corporate fraud worldwide, what systemic shifts would emerge in consumer behavior?'
        }
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Ethics',
    nameKo: '기술 & 윤리',
    subTopics: [
      {
        id: 'ai_automation',
        title: 'AI & Labor Automation',
        description: 'Generative AI, workforce displacement, and human-AI collaboration.',
        cognitiveQuestions: {
          level1: 'Describe an AI tool or automated service you encounter in your daily life.',
          level2: 'In what ways does generative AI challenge traditional metrics of human intellectual achievement in white-collar professions?',
          level3: 'Were autonomous AI systems granted intellectual property rights for original inventions, what fundamental revisions to copyright jurisprudence would become inevitable?'
        }
      },
      {
        id: 'surveillance_privacy',
        title: 'Surveillance & Digital Privacy',
        description: 'Biometric tracking, personal data commercialization, and civil liberties.',
        cognitiveQuestions: {
          level1: 'How do you personally manage your privacy settings and passwords online?',
          level2: 'How does the public perception of state surveillance differ from corporate surveillance in modern digital societies?',
          level3: 'Should individuals possess an absolute, inalienable right to total digital anonymity, what repercussions might arise for global cybersecurity enforcement?'
        }
      }
    ]
  },
  {
    id: 'urban_society',
    name: 'Urban Planning & Social Structure',
    nameKo: '도시 & 사회 구조',
    subTopics: [
      {
        id: 'gentrification',
        title: 'Urban Regeneration & Gentrification',
        description: 'Affordable housing, cultural preservation, and neighborhood commercialization.',
        cognitiveQuestions: {
          level1: 'Describe a neighborhood in your city that has experienced rapid commercial changes recently.',
          level2: 'How can municipal governments balance the influx of private capital with the socioeconomic preservation of vulnerable communities?',
          level3: 'If hyper-urbanization continues unchecked, how will the psychological contract between citizens and physical public spaces be permanently altered?'
        }
      },
      {
        id: 'demographics',
        title: 'Demographic Shifts & Aging Societies',
        description: 'Declining fertility rates, pension sustainability, and multigenerational care.',
        cognitiveQuestions: {
          level1: 'What public services are available for elderly citizens in your hometown?',
          level2: 'Analyze the socioeconomic trade-offs between raising the retirement age and expanding skilled immigration to alleviate labor shortages.',
          level3: 'Were human life expectancy reliably extended to 120 years through biotechnology, how would modern educational and career milestones need to be restructured?'
        }
      }
    ]
  },
  {
    id: 'economy_consumption',
    name: 'Economy & Consumer Culture',
    nameKo: '경제 & 소비 문화',
    subTopics: [
      {
        id: 'gig_economy',
        title: 'Gig Economy & Labor Rights',
        description: 'Platform workers, employment stability, and the future of unions.',
        cognitiveQuestions: {
          level1: 'Describe a gig service, such as food delivery or ride-sharing, that you frequently use.',
          level2: 'How does algorithmic management in gig platforms impact worker autonomy compared to traditional corporate hierarchies?',
          level3: 'Were platform companies mandated to provide full employment benefits to all independent contractors, how would the unit economics of the on-demand economy survive?'
        }
      },
      {
        id: 'fast_fashion',
        title: 'Fast Fashion & Sustainable Consumption',
        description: 'Consumerism, textile waste, and ethical supply chains.',
        cognitiveQuestions: {
          level1: 'Where do you usually purchase clothing, and what factors influence your buying decisions?',
          level2: 'Why does a significant discrepancy exist between consumers’ environmental values and their actual purchasing habits regarding ultra-fast fashion?',
          level3: 'If international law mandated complete supply chain transparency with immediate embargoes on unethical production, how would global fashion brands adapt?'
        }
      }
    ]
  },
  {
    id: 'education',
    name: 'Education & Knowledge Acquisition',
    nameKo: '교육 & 지식 습득',
    subTopics: [
      {
        id: 'pedagogy_ai',
        title: 'AI in Pedagogy & Standardized Testing',
        description: 'Adaptive learning platforms, rote memorization, and critical thinking evaluation.',
        cognitiveQuestions: {
          level1: 'Describe your typical routine when preparing for an important academic or professional exam.',
          level2: 'How does personalized AI tutoring alter the traditional socio-emotional role of human classroom educators?',
          level3: 'Were standardized exams entirely abolished in favor of continuous algorithmic cognitive tracking, what subtle biases might be amplified in university admissions?'
        }
      }
    ]
  },
  {
    id: 'arts_culture',
    name: 'Arts, Media & Cultural Heritage',
    nameKo: '예술, 미디어 & 문화유산',
    subTopics: [
      {
        id: 'digital_media',
        title: 'Algorithmic Curation & Cultural Monopolies',
        description: 'Streaming algorithms, cultural homogenisation, and independent journalism.',
        cognitiveQuestions: {
          level1: 'What streaming platforms or social media feeds do you interact with most frequently?',
          level2: 'How do recommendation algorithms shape aesthetic and musical subcultures compared to pre-internet grassroots movements?',
          level3: 'Should algorithms that dictate public information consumption be designated as public utilities subject to democratic oversight?'
        }
      }
    ]
  },
  {
    id: 'psychology',
    name: 'Psychology & Social Well-being',
    nameKo: '심리 & 인간관계',
    subTopics: [
      {
        id: 'loneliness_epidemic',
        title: 'Hyper-connectivity & The Loneliness Epidemic',
        description: 'Social media isolation, third places, and parasocial attachments.',
        cognitiveQuestions: {
          level1: 'Describe an activity or place where you feel genuinely connected to friends or family.',
          level2: 'Why has the proliferation of instant messaging platforms correlated with an increase in reported social anxiety among young adults?',
          level3: 'If synthetic companion AIs become emotionally indistinguishable from humans, how might that redefine the evolutionary necessity of reciprocal human vulnerability?'
        }
      }
    ]
  },
  {
    id: 'global_governance',
    name: 'Global Governance & Digital Rights',
    nameKo: '글로벌 거버넌스 & 법',
    subTopics: [
      {
        id: 'digital_sovereignty',
        title: 'Cross-border Data Sovereignty & Tech Monopolies',
        description: 'Transnational tech giants, antitrust legislation, and digital citizenship.',
        cognitiveQuestions: {
          level1: 'Talk about an international brand or technology product that is essential in your daily routine.',
          level2: 'How do conflicting data protection regulations across jurisdictions create regulatory friction for global digital commerce?',
          level3: 'In the event that private corporations achieve greater economic and technological influence than sovereign nation-states, what novel frameworks of international law must emerge?'
        }
      }
    ]
  }
];

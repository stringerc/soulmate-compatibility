/**
 * Story-Based Scenarios for Interactive Compatibility Quest
 * 
 * Each scenario maps to a dimension in the 32D trait vector.
 * Scenarios are presented as visual cards with multiple choice options.
 */

export interface ScenarioCard {
  index: number;
  category: string;
  dimension: string;
  chapter: string;
  storyText: string;
  choices: ScenarioChoice[];
  visualTheme: string; // For styling
}

export interface ScenarioChoice {
  text: string;
  value: number; // 0-1 scale
  visualIcon?: string;
  description?: string;
}

export const STORY_SCENARIOS: ScenarioCard[] = [
  // Attachment & Regulation (0-4)
  {
    index: 0,
    category: 'Attachment & Regulation',
    dimension: 'A1_attachment_security',
    chapter: 'Chapter 1: The First Meeting',
    storyText: 'You\'re meeting someone special for the first time. They\'re running 15 minutes late. What\'s your first thought?',
    visualTheme: 'sunset',
    choices: [
      {
        text: 'They must have a good reason',
        value: 0.9,
        visualIcon: '🌅',
        description: 'High security - trusting and understanding'
      },
      {
        text: 'Did I get the time or place wrong?',
        value: 0.3,
        visualIcon: '🤔',
        description: 'Low security - self-doubt and worry'
      },
      {
        text: 'I\'m disappointed but I\'ll ask what happened',
        value: 0.6,
        visualIcon: '💭',
        description: 'Moderate security - balanced response'
      },
      {
        text: 'I\'ll call to make sure everything\'s okay',
        value: 0.75,
        visualIcon: '📞',
        description: 'Moderate-high security - caring but proactive'
      }
    ]
  },
  {
    index: 1,
    category: 'Attachment & Regulation',
    dimension: 'A2_abandonment_sensitivity',
    chapter: 'Chapter 1: The First Meeting',
    storyText: 'After a great first date, they don\'t text you back for 24 hours. How do you feel?',
    visualTheme: 'sunset',
    choices: [
      {
        text: 'They\'re probably busy, I\'ll wait',
        value: 0.2,
        visualIcon: '😌',
        description: 'Low sensitivity - secure and patient'
      },
      {
        text: 'Did I do something wrong?',
        value: 0.9,
        visualIcon: '😰',
        description: 'High sensitivity - anxious and worried'
      },
      {
        text: 'I\'m a bit concerned, but I\'ll give it time',
        value: 0.5,
        visualIcon: '🤷',
        description: 'Moderate sensitivity - aware but balanced'
      },
      {
        text: 'I\'ll send a friendly check-in message',
        value: 0.65,
        visualIcon: '💬',
        description: 'Moderate-high sensitivity - proactive communication'
      }
    ]
  },
  {
    index: 2,
    category: 'Attachment & Regulation',
    dimension: 'A3_emotional_regulation',
    chapter: 'Chapter 1: The First Meeting',
    storyText: 'Your partner cancels plans last minute because they\'re stressed about work. You feel:',
    visualTheme: 'sunset',
    choices: [
      {
        text: 'Understanding - I\'ll be supportive',
        value: 0.9,
        visualIcon: '🤗',
        description: 'High regulation - empathetic and calm'
      },
      {
        text: 'Frustrated - they should have planned better',
        value: 0.2,
        visualIcon: '😤',
        description: 'Low regulation - reactive and frustrated'
      },
      {
        text: 'Disappointed but I understand',
        value: 0.6,
        visualIcon: '😔',
        description: 'Moderate regulation - balanced emotions'
      },
      {
        text: 'I\'ll help them manage their stress',
        value: 0.8,
        visualIcon: '💪',
        description: 'High regulation - proactive support'
      }
    ]
  },
  {
    index: 3,
    category: 'Attachment & Regulation',
    dimension: 'A4_coregulation_skill',
    chapter: 'Chapter 1: The First Meeting',
    storyText: 'Your partner is visibly upset about something. Your first instinct is to:',
    visualTheme: 'sunset',
    choices: [
      {
        text: 'Give them space to process',
        value: 0.4,
        visualIcon: '🚶',
        description: 'Low coregulation - respect boundaries'
      },
      {
        text: 'Ask what\'s wrong and offer comfort',
        value: 0.9,
        visualIcon: '💕',
        description: 'High coregulation - active support'
      },
      {
        text: 'Wait and see if they want to talk',
        value: 0.6,
        visualIcon: '👀',
        description: 'Moderate coregulation - balanced approach'
      },
      {
        text: 'Try to distract them with something positive',
        value: 0.7,
        visualIcon: '✨',
        description: 'Moderate-high coregulation - positive intervention'
      }
    ]
  },
  {
    index: 4,
    category: 'Attachment & Regulation',
    dimension: 'A5_distress_tolerance',
    chapter: 'Chapter 1: The First Meeting',
    storyText: 'Your relationship hits its first major challenge. You think:',
    visualTheme: 'sunset',
    choices: [
      {
        text: 'This is normal - we\'ll work through it',
        value: 0.9,
        visualIcon: '🌱',
        description: 'High tolerance - resilient and optimistic'
      },
      {
        text: 'This might be a sign we\'re not compatible',
        value: 0.2,
        visualIcon: '😟',
        description: 'Low tolerance - quick to doubt'
      },
      {
        text: 'I\'m worried but willing to try',
        value: 0.5,
        visualIcon: '🤞',
        description: 'Moderate tolerance - cautious but open'
      },
      {
        text: 'Challenges make relationships stronger',
        value: 0.85,
        visualIcon: '💎',
        description: 'High tolerance - growth mindset'
      }
    ]
  },
  
  // Conflict & Communication (5-9)
  {
    index: 5,
    category: 'Conflict & Communication',
    dimension: 'C1_conflict_style',
    chapter: 'Chapter 2: Building Trust',
    storyText: 'Your partner criticizes something you did. Your immediate response is:',
    visualTheme: 'ocean',
    choices: [
      {
        text: 'Address it immediately and directly',
        value: 0.9,
        visualIcon: '⚡',
        description: 'Direct style - confrontational'
      },
      {
        text: 'Wait until we\'re both calm to discuss',
        value: 0.7,
        visualIcon: '🌊',
        description: 'Mediated style - thoughtful'
      },
      {
        text: 'Avoid discussing it if possible',
        value: 0.2,
        visualIcon: '🌫️',
        description: 'Avoidant style - conflict-averse'
      },
      {
        text: 'Ask for clarification first',
        value: 0.8,
        visualIcon: '🔍',
        description: 'Inquisitive style - understanding-focused'
      }
    ]
  },
  {
    index: 6,
    category: 'Conflict & Communication',
    dimension: 'C2_repair_efficiency',
    chapter: 'Chapter 2: Building Trust',
    storyText: 'After a disagreement, you and your partner are both upset. You:',
    visualTheme: 'ocean',
    choices: [
      {
        text: 'Give it time and space to cool down',
        value: 0.4,
        visualIcon: '⏰',
        description: 'Slow repair - needs time'
      },
      {
        text: 'Reach out to apologize and reconnect',
        value: 0.9,
        visualIcon: '🤝',
        description: 'Fast repair - proactive'
      },
      {
        text: 'Wait for them to make the first move',
        value: 0.3,
        visualIcon: '👤',
        description: 'Passive repair - waits for partner'
      },
      {
        text: 'Suggest doing something fun together',
        value: 0.8,
        visualIcon: '🎈',
        description: 'Active repair - positive action'
      }
    ]
  },
  {
    index: 7,
    category: 'Conflict & Communication',
    dimension: 'C3_blame_responsibility_index',
    chapter: 'Chapter 2: Building Trust',
    storyText: 'A conflict arises where you both contributed. You think:',
    visualTheme: 'ocean',
    choices: [
      {
        text: 'I should take responsibility for my part',
        value: 0.9,
        visualIcon: '🙋',
        description: 'High responsibility - self-aware'
      },
      {
        text: 'They started it, so it\'s their fault',
        value: 0.1,
        visualIcon: '👆',
        description: 'Low responsibility - blames others'
      },
      {
        text: 'We both made mistakes',
        value: 0.7,
        visualIcon: '🤝',
        description: 'Shared responsibility - balanced'
      },
      {
        text: 'I\'ll focus on what I can control',
        value: 0.8,
        visualIcon: '🎯',
        description: 'High responsibility - solution-focused'
      }
    ]
  },
  {
    index: 8,
    category: 'Conflict & Communication',
    dimension: 'C4_listening_depth',
    chapter: 'Chapter 2: Building Trust',
    storyText: 'Your partner is sharing something important. You:',
    visualTheme: 'ocean',
    choices: [
      {
        text: 'Listen fully and ask thoughtful questions',
        value: 0.9,
        visualIcon: '👂',
        description: 'Deep listening - fully engaged'
      },
      {
        text: 'Nod along while thinking about your response',
        value: 0.3,
        visualIcon: '🤔',
        description: 'Surface listening - distracted'
      },
      {
        text: 'Try to understand their perspective',
        value: 0.7,
        visualIcon: '💭',
        description: 'Moderate listening - empathetic'
      },
      {
        text: 'Reflect back what you heard',
        value: 0.85,
        visualIcon: '🔄',
        description: 'Active listening - validating'
      }
    ]
  },
  {
    index: 9,
    category: 'Conflict & Communication',
    dimension: 'C5_metacommunication_skill',
    chapter: 'Chapter 2: Building Trust',
    storyText: 'You notice you and your partner keep having the same argument. You:',
    visualTheme: 'ocean',
    choices: [
      {
        text: 'Suggest discussing how we communicate',
        value: 0.9,
        visualIcon: '💬',
        description: 'High metacommunication - reflective'
      },
      {
        text: 'Just try to avoid that topic',
        value: 0.2,
        visualIcon: '🚫',
        description: 'Low metacommunication - avoidance'
      },
      {
        text: 'Try a different approach next time',
        value: 0.6,
        visualIcon: '🔄',
        description: 'Moderate metacommunication - adaptive'
      },
      {
        text: 'Ask what we can learn from this pattern',
        value: 0.85,
        visualIcon: '📚',
        description: 'High metacommunication - growth-oriented'
      }
    ]
  },
  
  // Cognitive & Decision Style (10-14)
  {
    index: 10,
    category: 'Cognitive & Decision Style',
    dimension: 'T1_analytical_decision_making',
    chapter: 'Chapter 3: Making Decisions Together',
    storyText: 'You need to make an important decision together. You prefer to:',
    visualTheme: 'forest',
    choices: [
      {
        text: 'Research and analyze all options first',
        value: 0.9,
        visualIcon: '📊',
        description: 'High analytical - data-driven'
      },
      {
        text: 'Go with your gut feeling',
        value: 0.2,
        visualIcon: '💫',
        description: 'Low analytical - intuitive'
      },
      {
        text: 'Discuss pros and cons together',
        value: 0.7,
        visualIcon: '⚖️',
        description: 'Moderate analytical - collaborative'
      },
      {
        text: 'Make a list and evaluate systematically',
        value: 0.85,
        visualIcon: '📝',
        description: 'High analytical - structured'
      }
    ]
  },
  {
    index: 11,
    category: 'Cognitive & Decision Style',
    dimension: 'T2_intuitive_decision_making',
    chapter: 'Chapter 3: Making Decisions Together',
    storyText: 'When choosing where to go on a date, you:',
    visualTheme: 'forest',
    choices: [
      {
        text: 'Go with whatever feels right in the moment',
        value: 0.9,
        visualIcon: '✨',
        description: 'High intuitive - spontaneous'
      },
      {
        text: 'Research reviews and plan carefully',
        value: 0.2,
        visualIcon: '🔍',
        description: 'Low intuitive - planned'
      },
      {
        text: 'Balance planning with spontaneity',
        value: 0.5,
        visualIcon: '🎯',
        description: 'Moderate intuitive - balanced'
      },
      {
        text: 'Trust your first instinct',
        value: 0.8,
        visualIcon: '💡',
        description: 'High intuitive - instinct-driven'
      }
    ]
  },
  {
    index: 12,
    category: 'Cognitive & Decision Style',
    dimension: 'T3_abstraction_preference',
    chapter: 'Chapter 3: Making Decisions Together',
    storyText: 'Your ideal conversation topic is:',
    visualTheme: 'forest',
    choices: [
      {
        text: 'Philosophical questions about life',
        value: 0.9,
        visualIcon: '🌌',
        description: 'High abstraction - deep thinking'
      },
      {
        text: 'Practical day-to-day topics',
        value: 0.2,
        visualIcon: '📅',
        description: 'Low abstraction - concrete'
      },
      {
        text: 'Mix of deep and practical topics',
        value: 0.5,
        visualIcon: '🔄',
        description: 'Moderate abstraction - balanced'
      },
      {
        text: 'Theories and big ideas',
        value: 0.85,
        visualIcon: '💭',
        description: 'High abstraction - theoretical'
      }
    ]
  },
  {
    index: 13,
    category: 'Cognitive & Decision Style',
    dimension: 'T4_concreteness_preference',
    chapter: 'Chapter 3: Making Decisions Together',
    storyText: 'When planning your future together, you focus on:',
    visualTheme: 'forest',
    choices: [
      {
        text: 'Specific, actionable steps',
        value: 0.9,
        visualIcon: '✅',
        description: 'High concreteness - practical'
      },
      {
        text: 'Big picture vision and dreams',
        value: 0.2,
        visualIcon: '🌈',
        description: 'Low concreteness - visionary'
      },
      {
        text: 'Both vision and practical steps',
        value: 0.6,
        visualIcon: '🎯',
        description: 'Moderate concreteness - balanced'
      },
      {
        text: 'Detailed timelines and milestones',
        value: 0.85,
        visualIcon: '📅',
        description: 'High concreteness - structured'
      }
    ]
  },
  {
    index: 14,
    category: 'Cognitive & Decision Style',
    dimension: 'T5_cognitive_flexibility',
    chapter: 'Chapter 3: Making Decisions Together',
    storyText: 'Your partner suggests a completely different approach than yours. You:',
    visualTheme: 'forest',
    choices: [
      {
        text: 'Stick to your original plan',
        value: 0.2,
        visualIcon: '🔒',
        description: 'Low flexibility - rigid'
      },
      {
        text: 'Consider their perspective and adapt',
        value: 0.9,
        visualIcon: '🔄',
        description: 'High flexibility - adaptable'
      },
      {
        text: 'Compromise and find middle ground',
        value: 0.7,
        visualIcon: '🤝',
        description: 'Moderate flexibility - collaborative'
      },
      {
        text: 'Try their way and see how it works',
        value: 0.85,
        visualIcon: '🧪',
        description: 'High flexibility - experimental'
      }
    ]
  },
  
  // Value Architecture (15-20) - Continuing with abbreviated examples
  {
    index: 15,
    category: 'Value Architecture',
    dimension: 'V1_autonomy_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'When it comes to personal space in a relationship, you value:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Complete independence', value: 0.9, visualIcon: '🏔️' },
      { text: 'Being together most of the time', value: 0.2, visualIcon: '👫' },
      { text: 'Balance of togetherness and space', value: 0.5, visualIcon: '⚖️' },
      { text: 'Independence within togetherness', value: 0.75, visualIcon: '🌉' }
    ]
  },
  {
    index: 16,
    category: 'Value Architecture',
    dimension: 'V2_family_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'Family time vs career advancement - you prioritize:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Family always comes first', value: 0.9, visualIcon: '👨‍👩‍👧‍👦' },
      { text: 'Career success is most important', value: 0.2, visualIcon: '💼' },
      { text: 'Balance both equally', value: 0.5, visualIcon: '⚖️' },
      { text: 'Depends on the situation', value: 0.6, visualIcon: '🔄' }
    ]
  },
  {
    index: 17,
    category: 'Value Architecture',
    dimension: 'V3_novelty_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'Your ideal weekend involves:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Trying something completely new', value: 0.9, visualIcon: '🎲' },
      { text: 'Sticking to familiar routines', value: 0.2, visualIcon: '🏠' },
      { text: 'Mix of new and familiar', value: 0.5, visualIcon: '🎨' },
      { text: 'Spontaneous adventures', value: 0.85, visualIcon: '🗺️' }
    ]
  },
  {
    index: 18,
    category: 'Value Architecture',
    dimension: 'V4_stability_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'When life gets unpredictable, you:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Create routines to feel grounded', value: 0.9, visualIcon: '🏛️' },
      { text: 'Embrace the chaos', value: 0.2, visualIcon: '🌀' },
      { text: 'Adapt while maintaining some structure', value: 0.6, visualIcon: '🌊' },
      { text: 'Seek comfort in familiar things', value: 0.8, visualIcon: '🛋️' }
    ]
  },
  {
    index: 19,
    category: 'Value Architecture',
    dimension: 'V5_growth_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'In a relationship, you prioritize:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Personal growth and self-improvement', value: 0.9, visualIcon: '🌱' },
      { text: 'Comfort and acceptance as-is', value: 0.2, visualIcon: '💤' },
      { text: 'Growing together', value: 0.7, visualIcon: '🤝' },
      { text: 'Continuous learning and development', value: 0.85, visualIcon: '📚' }
    ]
  },
  {
    index: 20,
    category: 'Value Architecture',
    dimension: 'V6_tradition_value',
    chapter: 'Chapter 4: What Matters Most',
    storyText: 'When it comes to relationship milestones, you:',
    visualTheme: 'mountain',
    choices: [
      { text: 'Value traditional steps and timing', value: 0.9, visualIcon: '📿' },
      { text: 'Prefer to create your own path', value: 0.2, visualIcon: '🛤️' },
      { text: 'Mix tradition with personal values', value: 0.5, visualIcon: '🎭' },
      { text: 'Respect traditions but adapt them', value: 0.7, visualIcon: '🔄' }
    ]
  },
  
  // Social & Interpersonal Style (21-25)
  {
    index: 21,
    category: 'Social & Interpersonal Style',
    dimension: 'S1_extroversion',
    chapter: 'Chapter 5: Social Connections',
    storyText: 'Your ideal social gathering is:',
    visualTheme: 'city',
    choices: [
      { text: 'Large party with many people', value: 0.9, visualIcon: '🎉' },
      { text: 'Small intimate gathering', value: 0.2, visualIcon: '🕯️' },
      { text: 'Medium-sized group of close friends', value: 0.5, visualIcon: '👥' },
      { text: 'One-on-one deep conversation', value: 0.3, visualIcon: '💬' }
    ]
  },
  {
    index: 22,
    category: 'Social & Interpersonal Style',
    dimension: 'S2_introversion_preference',
    chapter: 'Chapter 5: Social Connections',
    storyText: 'After a busy social week, you need:',
    visualTheme: 'city',
    choices: [
      { text: 'More social time to recharge', value: 0.2, visualIcon: '🔋' },
      { text: 'Alone time to recharge', value: 0.9, visualIcon: '🛋️' },
      { text: 'Quiet time with your partner', value: 0.6, visualIcon: '👫' },
      { text: 'Balance of social and alone time', value: 0.5, visualIcon: '⚖️' }
    ]
  },
  {
    index: 23,
    category: 'Social & Interpersonal Style',
    dimension: 'S3_attention_comfort',
    chapter: 'Chapter 5: Social Connections',
    storyText: 'At a party, you prefer to:',
    visualTheme: 'city',
    choices: [
      { text: 'Be the center of attention', value: 0.9, visualIcon: '⭐' },
      { text: 'Stay in the background', value: 0.2, visualIcon: '🌙' },
      { text: 'Have moments of both', value: 0.5, visualIcon: '🌓' },
      { text: 'Engage with small groups', value: 0.6, visualIcon: '👥' }
    ]
  },
  {
    index: 24,
    category: 'Social & Interpersonal Style',
    dimension: 'S4_conversation_depth_preference',
    chapter: 'Chapter 5: Social Connections',
    storyText: 'Your ideal conversation is:',
    visualTheme: 'city',
    choices: [
      { text: 'Deep, meaningful topics', value: 0.9, visualIcon: '🌊' },
      { text: 'Light, fun small talk', value: 0.2, visualIcon: '💨' },
      { text: 'Mix of deep and light topics', value: 0.5, visualIcon: '🌊💨' },
      { text: 'Philosophical discussions', value: 0.85, visualIcon: '💭' }
    ]
  },
  {
    index: 25,
    category: 'Social & Interpersonal Style',
    dimension: 'S5_social_adaptability',
    chapter: 'Chapter 5: Social Connections',
    storyText: 'In a new social situation, you:',
    visualTheme: 'city',
    choices: [
      { text: 'Adapt quickly to the group', value: 0.9, visualIcon: '🦎' },
      { text: 'Stay true to yourself regardless', value: 0.3, visualIcon: '🗿' },
      { text: 'Observe first, then engage', value: 0.6, visualIcon: '👀' },
      { text: 'Find your people and connect', value: 0.7, visualIcon: '🔗' }
    ]
  },
  
  // Sexual System (26-28)
  {
    index: 26,
    category: 'Sexual System',
    dimension: 'X1_physical_intimacy_importance',
    chapter: 'Chapter 6: Intimacy & Connection',
    storyText: 'Physical intimacy in a relationship is:',
    visualTheme: 'sunset',
    choices: [
      { text: 'Essential for connection', value: 0.9, visualIcon: '💕' },
      { text: 'Nice but not necessary', value: 0.3, visualIcon: '🤗' },
      { text: 'Important but not everything', value: 0.6, visualIcon: '💝' },
      { text: 'One of many ways to connect', value: 0.5, visualIcon: '🌈' }
    ]
  },
  {
    index: 27,
    category: 'Sexual System',
    dimension: 'X2_emotional_connection_in_intimacy',
    chapter: 'Chapter 6: Intimacy & Connection',
    storyText: 'For physical intimacy to feel meaningful, you need:',
    visualTheme: 'sunset',
    choices: [
      { text: 'Deep emotional connection', value: 0.9, visualIcon: '💞' },
      { text: 'Physical attraction is enough', value: 0.2, visualIcon: '🔥' },
      { text: 'Some emotional connection', value: 0.6, visualIcon: '💗' },
      { text: 'Trust and respect', value: 0.75, visualIcon: '🤝' }
    ]
  },
  {
    index: 28,
    category: 'Sexual System',
    dimension: 'X3_sexual_communication_comfort',
    chapter: 'Chapter 6: Intimacy & Connection',
    storyText: 'When it comes to discussing intimacy needs, you:',
    visualTheme: 'sunset',
    choices: [
      { text: 'Feel comfortable talking openly', value: 0.9, visualIcon: '💬' },
      { text: 'Prefer to show rather than tell', value: 0.3, visualIcon: '🤐' },
      { text: 'Can discuss if needed', value: 0.6, visualIcon: '🗣️' },
      { text: 'Value open communication about it', value: 0.85, visualIcon: '📢' }
    ]
  },
  
  // Life Structure (29-31)
  {
    index: 29,
    category: 'Life Structure',
    dimension: 'L1_routine_preference',
    chapter: 'Chapter 7: Daily Life Together',
    storyText: 'Your ideal daily routine involves:',
    visualTheme: 'garden',
    choices: [
      { text: 'Structured schedule', value: 0.9, visualIcon: '📅' },
      { text: 'Complete flexibility', value: 0.2, visualIcon: '🌀' },
      { text: 'Some structure with flexibility', value: 0.5, visualIcon: '🎯' },
      { text: 'Routine with room for spontaneity', value: 0.7, visualIcon: '✨' }
    ]
  },
  {
    index: 30,
    category: 'Life Structure',
    dimension: 'L2_work_life_balance_value',
    chapter: 'Chapter 7: Daily Life Together',
    storyText: 'When work demands increase, you:',
    visualTheme: 'garden',
    choices: [
      { text: 'Protect relationship time', value: 0.9, visualIcon: '🛡️' },
      { text: 'Focus on work, relationship adapts', value: 0.2, visualIcon: '💼' },
      { text: 'Find balance between both', value: 0.6, visualIcon: '⚖️' },
      { text: 'Communicate and adjust together', value: 0.8, visualIcon: '🤝' }
    ]
  },
  {
    index: 31,
    category: 'Life Structure',
    dimension: 'L3_lifestyle_flexibility',
    chapter: 'Chapter 7: Daily Life Together',
    storyText: 'Your partner wants to change your weekend plans. You:',
    visualTheme: 'garden',
    choices: [
      { text: 'Stick to the original plan', value: 0.2, visualIcon: '🔒' },
      { text: 'Adapt easily to their suggestion', value: 0.9, visualIcon: '🔄' },
      { text: 'Discuss and find compromise', value: 0.7, visualIcon: '🤝' },
      { text: 'Be flexible if it\'s important to them', value: 0.8, visualIcon: '💝' }
    ]
  }
];

export const CHAPTER_THEMES: Record<string, { name: string; color: string; icon: string; bgColor: string; textColor: string }> = {
  'Chapter 1: The First Meeting': { 
    name: 'The First Meeting', 
    color: 'from-orange-600 to-pink-600', 
    bgColor: 'from-orange-50 to-pink-50',
    textColor: 'text-gray-900',
    icon: '🌅' 
  },
  'Chapter 2: Building Trust': { 
    name: 'Building Trust', 
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
    textColor: 'text-gray-900',
    icon: '🌊' 
  },
  'Chapter 3: Making Decisions Together': { 
    name: 'Making Decisions', 
    color: 'from-green-600 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    textColor: 'text-gray-900',
    icon: '🌲' 
  },
  'Chapter 4: What Matters Most': { 
    name: 'What Matters Most', 
    color: 'from-purple-600 to-indigo-600',
    bgColor: 'from-purple-50 to-indigo-50',
    textColor: 'text-gray-900',
    icon: '⛰️' 
  },
  'Chapter 5: Social Connections': { 
    name: 'Social Connections', 
    color: 'from-pink-600 to-rose-600',
    bgColor: 'from-pink-50 to-rose-50',
    textColor: 'text-gray-900',
    icon: '🏙️' 
  },
  'Chapter 6: Intimacy & Connection': { 
    name: 'Intimacy & Connection', 
    color: 'from-red-600 to-pink-600',
    bgColor: 'from-red-50 to-pink-50',
    textColor: 'text-gray-900',
    icon: '💕' 
  },
  'Chapter 7: Daily Life Together': { 
    name: 'Daily Life Together', 
    color: 'from-yellow-600 to-orange-600',
    bgColor: 'from-yellow-50 to-orange-50',
    textColor: 'text-gray-900',
    icon: '🌻' 
  }
};

export function getCategoryChapters(): string[] {
  return Array.from(new Set(STORY_SCENARIOS.map(s => s.chapter)));
}

export function getScenariosForChapter(chapter: string): ScenarioCard[] {
  return STORY_SCENARIOS.filter(s => s.chapter === chapter);
}


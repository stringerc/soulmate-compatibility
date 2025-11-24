/**
 * 32-Question Questionnaire Mapping to 32D Trait Vector
 * 
 * Each question maps to one dimension of the 32D trait vector.
 * Questions are designed to be intuitive and cover all compatibility dimensions.
 */

export interface Question {
  index: number;
  category: string;
  question: string;
  dimension: string;
}

export const QUESTIONS: Question[] = [
  // Attachment & Regulation (0-4)
  {
    index: 0,
    category: 'Attachment & Regulation',
    question: 'I feel secure and comfortable in close relationships',
    dimension: 'A1_attachment_security',
  },
  {
    index: 1,
    category: 'Attachment & Regulation',
    question: 'I worry about being abandoned or rejected by my partner',
    dimension: 'A2_abandonment_sensitivity',
  },
  {
    index: 2,
    category: 'Attachment & Regulation',
    question: 'I can regulate my emotions effectively during conflicts',
    dimension: 'A3_emotional_regulation',
  },
  {
    index: 3,
    category: 'Attachment & Regulation',
    question: 'I help my partner regulate their emotions when they\'re distressed',
    dimension: 'A4_coregulation_skill',
  },
  {
    index: 4,
    category: 'Attachment & Regulation',
    question: 'I can handle relationship stress and uncertainty well',
    dimension: 'A5_distress_tolerance',
  },
  
  // Conflict & Communication (5-9)
  {
    index: 5,
    category: 'Conflict & Communication',
    question: 'I prefer to address conflicts directly rather than avoid them',
    dimension: 'C1_conflict_style',
  },
  {
    index: 6,
    category: 'Conflict & Communication',
    question: 'I can repair relationship ruptures and move forward quickly',
    dimension: 'C2_repair_efficiency',
  },
  {
    index: 7,
    category: 'Conflict & Communication',
    question: 'I take responsibility for my part in conflicts rather than blaming',
    dimension: 'C3_blame_responsibility_index',
  },
  {
    index: 8,
    category: 'Conflict & Communication',
    question: 'I listen deeply and try to understand my partner\'s perspective',
    dimension: 'C4_listening_depth',
  },
  {
    index: 9,
    category: 'Conflict & Communication',
    question: 'I can discuss our communication patterns and improve them together',
    dimension: 'C5_metacommunication_skill',
  },
  
  // Cognitive & Decision Style (10-14)
  {
    index: 10,
    category: 'Cognitive & Decision Style',
    question: 'I prefer to make decisions based on logic and analysis',
    dimension: 'T1_analytical_decision_making',
  },
  {
    index: 11,
    category: 'Cognitive & Decision Style',
    question: 'I value intuition and gut feelings in decision-making',
    dimension: 'T2_intuitive_decision_making',
  },
  {
    index: 12,
    category: 'Cognitive & Decision Style',
    question: 'I enjoy abstract thinking and philosophical discussions',
    dimension: 'T3_abstraction_preference',
  },
  {
    index: 13,
    category: 'Cognitive & Decision Style',
    question: 'I prefer concrete, practical solutions over theoretical ones',
    dimension: 'T4_concreteness_preference',
  },
  {
    index: 14,
    category: 'Cognitive & Decision Style',
    question: 'I can adapt my thinking style to match different situations',
    dimension: 'T5_cognitive_flexibility',
  },
  
  // Value Architecture (15-20)
  {
    index: 15,
    category: 'Value Architecture',
    question: 'I value independence and personal autonomy highly',
    dimension: 'V1_autonomy_value',
  },
  {
    index: 16,
    category: 'Value Architecture',
    question: 'I prioritize family and close relationships above career',
    dimension: 'V2_family_value',
  },
  {
    index: 17,
    category: 'Value Architecture',
    question: 'I value adventure and trying new experiences',
    dimension: 'V3_novelty_value',
  },
  {
    index: 18,
    category: 'Value Architecture',
    question: 'I prefer stability and routine over change',
    dimension: 'V4_stability_value',
  },
  {
    index: 19,
    category: 'Value Architecture',
    question: 'I value personal growth and self-improvement',
    dimension: 'V5_growth_value',
  },
  {
    index: 20,
    category: 'Value Architecture',
    question: 'I value tradition and maintaining established ways',
    dimension: 'V6_tradition_value',
  },
  
  // Social & Interpersonal Style (21-25)
  {
    index: 21,
    category: 'Social & Interpersonal Style',
    question: 'I am outgoing and enjoy social gatherings',
    dimension: 'S1_extroversion',
  },
  {
    index: 22,
    category: 'Social & Interpersonal Style',
    question: 'I prefer small, intimate gatherings over large parties',
    dimension: 'S2_introversion_preference',
  },
  {
    index: 23,
    category: 'Social & Interpersonal Style',
    question: 'I am comfortable being the center of attention',
    dimension: 'S3_attention_comfort',
  },
  {
    index: 24,
    category: 'Social & Interpersonal Style',
    question: 'I value deep, meaningful conversations over small talk',
    dimension: 'S4_conversation_depth_preference',
  },
  {
    index: 25,
    category: 'Social & Interpersonal Style',
    question: 'I can read social cues and adapt my behavior accordingly',
    dimension: 'S5_social_adaptability',
  },
  
  // Sexual System (26-28)
  {
    index: 26,
    category: 'Sexual System',
    question: 'Physical intimacy is an important part of relationships for me',
    dimension: 'X1_physical_intimacy_importance',
  },
  {
    index: 27,
    category: 'Sexual System',
    question: 'I value emotional connection during physical intimacy',
    dimension: 'X2_emotional_connection_in_intimacy',
  },
  {
    index: 28,
    category: 'Sexual System',
    question: 'I am comfortable discussing sexual needs and preferences',
    dimension: 'X3_sexual_communication_comfort',
  },
  
  // Life Structure (29-31)
  {
    index: 29,
    category: 'Life Structure',
    question: 'I prefer a structured daily routine',
    dimension: 'L1_routine_preference',
  },
  {
    index: 30,
    category: 'Life Structure',
    question: 'I value work-life balance',
    dimension: 'L2_work_life_balance_value',
  },
  {
    index: 31,
    category: 'Life Structure',
    question: 'I can adapt my lifestyle to accommodate a partner\'s needs',
    dimension: 'L3_lifestyle_flexibility',
  },
];

export const CATEGORIES = [
  'Attachment & Regulation',
  'Conflict & Communication',
  'Cognitive & Decision Style',
  'Value Architecture',
  'Social & Interpersonal Style',
  'Sexual System',
  'Life Structure',
];


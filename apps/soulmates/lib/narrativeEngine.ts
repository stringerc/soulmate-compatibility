/**
 * Narrative Engine - Creates narrative continuity between scenarios
 * Implements narrative transportation theory for enhanced engagement
 */

export interface NarrativeState {
  relationshipStage: 'first_meeting' | 'building_trust' | 'deepening' | 'integration';
  emotionalTone: 'excited' | 'cautious' | 'confident' | 'vulnerable';
  partnerTraits: string[]; // Derived from user's choices
  previousScenarios: number[]; // Indices of completed scenarios
  emotionalMoments: Array<{
    scenarioIndex: number;
    emotion: string;
    intensity: number;
  }>;
  narrativeArc: 'setup' | 'rising_action' | 'climax' | 'resolution';
}

export interface NarrativeHook {
  preScenario: string; // Emotional setup before scenario
  postScenario: string; // Emotional reflection after scenario
  narrativeContext: string; // How this connects to the story
}

/**
 * Generate narrative hook for a scenario based on narrative state
 */
export function generateNarrativeHook(
  scenarioIndex: number,
  narrativeState: NarrativeState,
  previousChoice?: { text: string; value: number }
): NarrativeHook {
  const { relationshipStage, emotionalTone, previousScenarios, narrativeArc } = narrativeState;
  
  // Determine narrative position
  let narrativePosition: string;
  if (scenarioIndex < 5) {
    narrativePosition = 'beginning';
  } else if (scenarioIndex < 15) {
    narrativePosition = 'middle';
  } else if (scenarioIndex < 25) {
    narrativePosition = 'climax';
  } else {
    narrativePosition = 'resolution';
  }
  
  // Generate pre-scenario hook
  const preScenario = generatePreScenarioHook(
    scenarioIndex,
    relationshipStage,
    emotionalTone,
    previousScenarios,
    previousChoice
  );
  
  // Generate post-scenario reflection
  const postScenario = generatePostScenarioReflection(
    scenarioIndex,
    relationshipStage,
    emotionalTone,
    narrativeArc
  );
  
  // Generate narrative context
  const narrativeContext = generateNarrativeContext(
    scenarioIndex,
    relationshipStage,
    previousScenarios.length
  );
  
  return {
    preScenario,
    postScenario,
    narrativeContext
  };
}

function generatePreScenarioHook(
  scenarioIndex: number,
  stage: NarrativeState['relationshipStage'],
  tone: NarrativeState['emotionalTone'],
  previousScenarios: number[],
  previousChoice?: { text: string; value: number }
): string {
  // Reference previous scenario if available
  if (previousScenarios.length > 0 && previousChoice) {
    const hooks: Record<string, string[]> = {
      first_meeting: [
        `After that moment, you're feeling ${tone} about where this is going...`,
        `Building on that experience, you find yourself...`,
        `That interaction left you wondering...`
      ],
      building_trust: [
        `Following that conversation, trust is ${tone === 'confident' ? 'growing' : 'being tested'}...`,
        `After what happened, you're ${tone} about the future...`,
        `That moment made you realize...`
      ],
      deepening: [
        `As your connection deepens, you're feeling ${tone}...`,
        `After that experience together, you're ${tone}...`,
        `That shared moment brought you closer...`
      ],
      integration: [
        `In your daily life together, you're ${tone}...`,
        `As you build a life together, you find yourself...`,
        `Living together has shown you...`
      ]
    };
    
    const stageHooks = hooks[stage] || hooks.first_meeting;
    return stageHooks[scenarioIndex % stageHooks.length];
  }
  
  // First scenario or no previous context
  const firstHooks: Record<string, string> = {
    first_meeting: "You're meeting someone special for the first time...",
    building_trust: "As you get to know each other better...",
    deepening: "Your relationship is growing deeper...",
    integration: "You're building a life together..."
  };
  
  return firstHooks[stage] || firstHooks.first_meeting;
}

function generatePostScenarioReflection(
  scenarioIndex: number,
  stage: NarrativeState['relationshipStage'],
  tone: NarrativeState['emotionalTone'],
  arc: NarrativeState['narrativeArc']
): string {
  const reflections: Record<string, string[]> = {
    setup: [
      "This moment reveals something important about you...",
      "Your response shows what matters to you...",
      "This choice reflects your values..."
    ],
    rising_action: [
      "As things get more complex, you're learning about yourself...",
      "This situation is testing your relationship...",
      "You're discovering new layers of compatibility..."
    ],
    climax: [
      "This is a defining moment in your relationship...",
      "How you handle this reveals your true compatibility...",
      "This challenge will shape your future together..."
    ],
    resolution: [
      "You're seeing the bigger picture now...",
      "All these moments are coming together...",
      "You're understanding what makes you compatible..."
    ]
  };
  
  const arcReflections = reflections[arc] || reflections.setup;
  return arcReflections[scenarioIndex % arcReflections.length];
}

function generateNarrativeContext(
  scenarioIndex: number,
  stage: NarrativeState['relationshipStage'],
  completedCount: number
): string {
  const contexts: Record<string, string[]> = {
    first_meeting: [
      "You're in the early stages of getting to know each other.",
      "First impressions are forming, and patterns are emerging.",
      "The foundation of your connection is being built."
    ],
    building_trust: [
      "Trust is being established through these interactions.",
      "You're learning to rely on each other.",
      "Your bond is strengthening with each moment."
    ],
    deepening: [
      "Your connection is moving beyond the surface.",
      "You're discovering deeper layers of compatibility.",
      "Intimacy is growing between you."
    ],
    integration: [
      "You're building a life together, day by day.",
      "Your relationship is becoming part of your daily reality.",
      "You're creating a shared future."
    ]
  };
  
  const stageContexts = contexts[stage] || contexts.first_meeting;
  return stageContexts[completedCount % stageContexts.length];
}

/**
 * Update narrative state based on scenario completion
 */
export function updateNarrativeState(
  currentState: NarrativeState,
  scenarioIndex: number,
  choiceValue: number,
  emotionalIntensity: number
): NarrativeState {
  const newState = { ...currentState };
  
  // Update relationship stage based on progress
  if (scenarioIndex < 5) {
    newState.relationshipStage = 'first_meeting';
    newState.narrativeArc = 'setup';
  } else if (scenarioIndex < 10) {
    newState.relationshipStage = 'building_trust';
    newState.narrativeArc = 'rising_action';
  } else if (scenarioIndex < 20) {
    newState.relationshipStage = 'deepening';
    newState.narrativeArc = 'rising_action';
  } else if (scenarioIndex < 25) {
    newState.narrativeArc = 'climax';
  } else {
    newState.relationshipStage = 'integration';
    newState.narrativeArc = 'resolution';
  }
  
  // Update emotional tone based on choices
  if (choiceValue > 0.7) {
    newState.emotionalTone = 'confident';
  } else if (choiceValue < 0.3) {
    newState.emotionalTone = 'cautious';
  } else if (emotionalIntensity > 0.7) {
    newState.emotionalTone = 'excited';
  } else {
    newState.emotionalTone = 'vulnerable';
  }
  
  // Track completed scenarios
  if (!newState.previousScenarios.includes(scenarioIndex)) {
    newState.previousScenarios.push(scenarioIndex);
  }
  
  // Track emotional moments
  if (emotionalIntensity > 0.6) {
    newState.emotionalMoments.push({
      scenarioIndex,
      emotion: newState.emotionalTone,
      intensity: emotionalIntensity
    });
  }
  
  return newState;
}

/**
 * Get relationship stage from scenario index
 */
export function getRelationshipStage(scenarioIndex: number): NarrativeState['relationshipStage'] {
  if (scenarioIndex < 5) return 'first_meeting';
  if (scenarioIndex < 10) return 'building_trust';
  if (scenarioIndex < 20) return 'deepening';
  return 'integration';
}

/**
 * Get narrative arc position from scenario index
 */
export function getNarrativeArc(scenarioIndex: number): NarrativeState['narrativeArc'] {
  if (scenarioIndex < 5) return 'setup';
  if (scenarioIndex < 25) return scenarioIndex < 20 ? 'rising_action' : 'climax';
  return 'resolution';
}


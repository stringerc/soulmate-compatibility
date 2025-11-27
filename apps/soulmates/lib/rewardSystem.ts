/**
 * Reward System - Micro-rewards, milestones, and surprise rewards
 * Implements gamification best practices for engagement and retention
 */

export type RewardType = 'micro' | 'milestone' | 'surprise' | 'completion';

export interface Reward {
  type: RewardType;
  id: string;
  message: string;
  animation: 'sparkle' | 'confetti' | 'heart' | 'star' | 'badge';
  timestamp: number;
  chapterIndex?: number;
  scenarioIndex?: number;
}

export interface RewardConfig {
  microRewardInterval: number; // Every N scenarios
  surpriseRewardProbability: number; // 0-1 probability
  milestoneRewards: boolean; // Chapter completion rewards
}

const DEFAULT_CONFIG: RewardConfig = {
  microRewardInterval: 4, // Every 4 scenarios
  surpriseRewardProbability: 0.2, // 20% chance
  milestoneRewards: true
};

/**
 * Check for rewards at current scenario
 */
export function checkRewards(
  scenarioIndex: number,
  chapterIndex: number,
  totalScenarios: number,
  isChapterComplete: boolean,
  config: RewardConfig = DEFAULT_CONFIG
): Reward[] {
  const rewards: Reward[] = [];
  
  // Micro-rewards (every N scenarios)
  if (shouldAwardMicroReward(scenarioIndex, config.microRewardInterval)) {
    rewards.push(createMicroReward(scenarioIndex));
  }
  
  // Surprise rewards (random, but not too frequent)
  if (shouldAwardSurpriseReward(scenarioIndex, config.surpriseRewardProbability)) {
    rewards.push(createSurpriseReward(scenarioIndex));
  }
  
  // Milestone rewards (chapter completion)
  if (isChapterComplete && config.milestoneRewards) {
    rewards.push(createMilestoneReward(chapterIndex));
  }
  
  // Completion reward (final scenario)
  if (scenarioIndex === totalScenarios - 1) {
    rewards.push(createCompletionReward());
  }
  
  return rewards;
}

function shouldAwardMicroReward(scenarioIndex: number, interval: number): boolean {
  // Award every N scenarios, but not on first scenario
  return scenarioIndex > 0 && (scenarioIndex + 1) % interval === 0;
}

function shouldAwardSurpriseReward(
  scenarioIndex: number,
  probability: number
): boolean {
  // Don't award on first few scenarios
  if (scenarioIndex < 3) return false;
  
  // Random chance, but ensure we don't award too frequently
  const random = Math.random();
  return random < probability;
}

function createMicroReward(scenarioIndex: number): Reward {
  const messages = [
    "Great progress! 🌟",
    "You're doing amazing! ✨",
    "Keep going! 💪",
    "You're on a roll! 🎯",
    "Excellent choice! 💎",
    "You're discovering yourself! 🔍"
  ];
  
  return {
    type: 'micro',
    id: `micro-${scenarioIndex}`,
    message: messages[scenarioIndex % messages.length],
    animation: 'sparkle',
    timestamp: Date.now(),
    scenarioIndex
  };
}

function createSurpriseReward(scenarioIndex: number): Reward {
  const messages = [
    "Surprise! You've unlocked a bonus insight! 🎁",
    "Bonus reward! You're special! ⭐",
    "Unexpected discovery! 🌈",
    "You've earned something extra! 💫",
    "Lucky you! Here's a bonus! 🍀"
  ];
  
  return {
    type: 'surprise',
    id: `surprise-${scenarioIndex}-${Date.now()}`,
    message: messages[Math.floor(Math.random() * messages.length)],
    animation: 'confetti',
    timestamp: Date.now(),
    scenarioIndex
  };
}

function createMilestoneReward(chapterIndex: number): Reward {
  const chapterNames = [
    "First Steps",
    "Trust Builder",
    "Decision Maker",
    "Value Seeker",
    "Social Butterfly",
    "Intimate Explorer",
    "Life Architect"
  ];
  
  return {
    type: 'milestone',
    id: `milestone-chapter-${chapterIndex}`,
    message: `Chapter Complete! You've mastered ${chapterNames[chapterIndex] || 'this chapter'}! 🏆`,
    animation: 'badge',
    timestamp: Date.now(),
    chapterIndex
  };
}

function createCompletionReward(): Reward {
  return {
    type: 'completion',
    id: 'completion-reward',
    message: "Congratulations! You've completed your compatibility journey! 🎉✨",
    animation: 'confetti',
    timestamp: Date.now()
  };
}

/**
 * Get reward animation class for CSS
 */
export function getRewardAnimationClass(animation: Reward['animation']): string {
  const classes: Record<Reward['animation'], string> = {
    sparkle: 'animate-pulse',
    confetti: 'animate-bounce',
    heart: 'animate-pulse',
    star: 'animate-spin',
    badge: 'animate-scale-in'
  };
  
  return classes[animation] || 'animate-pulse';
}


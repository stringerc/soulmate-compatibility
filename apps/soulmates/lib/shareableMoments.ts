/**
 * Shareable Moments System - Strategic share triggers at emotional peaks
 * Implements word-of-mouth psychology for viral growth
 */

export interface ShareableMoment {
  type: 'chapter_complete' | 'archetype_discovered' | 'compatibility_score' | 'completion' | 'reward' | 'emotional_peak';
  content: {
    title: string;
    description: string;
    shareText: string;
    hashtags: string[];
    imageUrl?: string; // For generated share cards
  };
  platforms: ('twitter' | 'facebook' | 'instagram' | 'whatsapp' | 'copy_link')[];
  timestamp: number;
}

/**
 * Check if we should show a share prompt at this moment
 */
export function shouldShowSharePrompt(
  scenarioIndex: number,
  chapterIndex: number,
  emotionalIntensity: number,
  achievements: string[],
  isChapterComplete: boolean,
  isCompletion: boolean
): boolean {
  // Always show at completion
  if (isCompletion) return true;
  
  // Show at chapter completion (emotional peak)
  if (isChapterComplete) return true;
  
  // Show at high emotional intensity moments
  if (emotionalIntensity > 0.8 && scenarioIndex > 5) return true;
  
  // Show at key milestones (scenarios 10, 20, 30)
  if ([10, 20, 30].includes(scenarioIndex)) return true;
  
  // Show after achievements
  if (achievements.length > 0 && achievements.length % 3 === 0) return true;
  
  return false;
}

/**
 * Generate shareable moment based on context
 */
export function generateShareableMoment(
  type: ShareableMoment['type'],
  context: {
    chapterIndex?: number;
    archetype?: string;
    compatibilityScore?: number;
    scenarioIndex?: number;
    achievement?: string;
  }
): ShareableMoment {
  switch (type) {
    case 'chapter_complete':
      return generateChapterCompleteShare(context.chapterIndex || 0);
    
    case 'archetype_discovered':
      return generateArchetypeShare(context.archetype || 'Explorer');
    
    case 'compatibility_score':
      return generateCompatibilityShare(context.compatibilityScore || 0);
    
    case 'completion':
      return generateCompletionShare();
    
    case 'reward':
      return generateRewardShare(context.achievement || 'Achievement');
    
    case 'emotional_peak':
      return generateEmotionalPeakShare(context.scenarioIndex || 0);
    
    default:
      return generateDefaultShare();
  }
}

function generateChapterCompleteShare(chapterIndex: number): ShareableMoment {
  const chapterNames = [
    "The First Meeting",
    "Building Trust",
    "Making Decisions Together",
    "What Matters Most",
    "Social Connections",
    "Intimacy & Connection",
    "Daily Life Together"
  ];
  
  const chapterName = chapterNames[chapterIndex] || `Chapter ${chapterIndex + 1}`;
  
  return {
    type: 'chapter_complete',
    content: {
      title: `I just completed "${chapterName}"! 🎯`,
      description: `Discovering my compatibility through an interactive journey. Find out yours!`,
      shareText: `I just completed "${chapterName}" in my compatibility journey! 🎯 Discover your compatibility at soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#RelationshipGoals', '#SelfDiscovery', '#CompatibilityTest']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateArchetypeShare(archetype: string): ShareableMoment {
  return {
    type: 'archetype_discovered',
    content: {
      title: `I'm a ${archetype}! ✨`,
      description: `Discover your compatibility archetype and find your ideal partner.`,
      shareText: `I just discovered I'm a ${archetype}! ✨ Find out your compatibility archetype at soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#Archetype', '#SelfDiscovery', '#CompatibilityTest']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateCompatibilityShare(score: number): ShareableMoment {
  const emoji = score >= 80 ? '💕' : score >= 60 ? '💖' : '💝';
  
  return {
    type: 'compatibility_score',
    content: {
      title: `I'm ${score}% compatible with my ideal partner! ${emoji}`,
      description: `Discover your compatibility score and find your perfect match.`,
      shareText: `I'm ${score}% compatible with my ideal partner! ${emoji} Find out your compatibility at soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#CompatibilityScore', '#RelationshipGoals', '#FindYourMatch']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateCompletionShare(): ShareableMoment {
  return {
    type: 'completion',
    content: {
      title: `I completed my compatibility journey! 🎉✨`,
      description: `Discover your compatibility through an interactive story. Start your journey today!`,
      shareText: `I just completed my compatibility journey! 🎉✨ Discover your compatibility at soulmates.syncscript.app #SoulmateCompatibility`,
      hashtags: ['#SoulmateCompatibility', '#CompatibilityJourney', '#SelfDiscovery', '#RelationshipGoals']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateRewardShare(achievement: string): ShareableMoment {
  return {
    type: 'reward',
    content: {
      title: `I just unlocked "${achievement}"! 🎁`,
      description: `Join me in discovering compatibility through an interactive journey.`,
      shareText: `I just unlocked "${achievement}"! 🎁 Discover your compatibility at soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#Achievement', '#SelfDiscovery']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateEmotionalPeakShare(scenarioIndex: number): ShareableMoment {
  return {
    type: 'emotional_peak',
    content: {
      title: `I'm discovering myself through this journey! 🌟`,
      description: `Every moment reveals something new. Start your compatibility journey today.`,
      shareText: `I'm discovering myself through this compatibility journey! 🌟 Join me at soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#SelfDiscovery', '#PersonalGrowth']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

function generateDefaultShare(): ShareableMoment {
  return {
    type: 'completion',
    content: {
      title: `Discover your compatibility! 💕`,
      description: `Take an interactive journey to discover your compatibility and find your ideal partner.`,
      shareText: `Discover your compatibility through an interactive journey! 💕 soulmates.syncscript.app`,
      hashtags: ['#SoulmateCompatibility', '#CompatibilityTest', '#SelfDiscovery']
    },
    platforms: ['twitter', 'facebook', 'instagram', 'whatsapp', 'copy_link'],
    timestamp: Date.now()
  };
}

/**
 * Share to platform
 */
export async function shareToPlatform(
  platform: ShareableMoment['platforms'][number],
  shareableMoment: ShareableMoment
): Promise<boolean> {
  const { shareText, hashtags } = shareableMoment.content;
  const fullText = `${shareText} ${hashtags.join(' ')}`;
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://soulmates.syncscript.app';
  
  try {
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`, '_blank');
        return true;
      
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        return true;
      
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard
        await navigator.clipboard.writeText(fullText);
        return true;
      
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText + ' ' + url)}`, '_blank');
        return true;
      
      case 'copy_link':
        await navigator.clipboard.writeText(fullText + ' ' + url);
        return true;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}


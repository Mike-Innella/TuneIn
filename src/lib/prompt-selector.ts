import type { 
  Prompt, 
  PromptPack, 
  PromptContext, 
  PromptPosition, 
  PromptType,
  Mood,
  PromptSettings 
} from '../types/prompts';

export interface SelectionOptions {
  type: PromptType;
  mood: Mood;
  position: PromptPosition;
  recentPrompts: string[]; // for cooldown
  packs: PromptPack[];
  settings: PromptSettings;
}

export class PromptSelector {
  /**
   * Main selection method - chooses appropriate prompt based on type and context
   */
  selectPrompt(options: SelectionOptions): Prompt | null {
    switch (options.type) {
      case 'manual':
        return this.selectManualPrompt(options);
      case 'emergent':
        return this.selectEmergentPrompt(options);
      case 'guided':
        return this.selectGuidedPrompt(options);
      default:
        return null;
    }
  }

  /**
   * Select from user-created or predefined manual prompts
   */
  private selectManualPrompt(options: SelectionOptions): Prompt | null {
    if (!options.settings.manualEnabled) return null;

    const manualPacks = options.packs.filter(pack => 
      pack.type === 'manual' && 
      pack.enabled
    );

    const eligiblePrompts = this.getEligiblePrompts(manualPacks, options);
    return this.weightedRandomSelect(eligiblePrompts, options.recentPrompts);
  }

  /**
   * Select from emergent/adaptive prompts based on rules
   */
  private selectEmergentPrompt(options: SelectionOptions): Prompt | null {
    if (!options.settings.emergentEnabled) return null;

    const emergentPacks = options.packs.filter(pack => 
      pack.type === 'emergent' && 
      pack.enabled
    );

    let eligiblePrompts = this.getEligiblePrompts(emergentPacks, options);

    // Apply emergent-specific filtering based on position and intensity
    eligiblePrompts = this.filterEmergentByPosition(eligiblePrompts, options);
    eligiblePrompts = this.applyIntensityWeighting(eligiblePrompts, options.settings.emergentIntensity);

    return this.weightedRandomSelect(eligiblePrompts, options.recentPrompts);
  }

  /**
   * Select from guided technique prompts
   */
  private selectGuidedPrompt(options: SelectionOptions): Prompt | null {
    if (!options.settings.guidedEnabled) return null;

    const guidedPacks = options.packs.filter(pack => 
      pack.type === 'guided' && 
      pack.enabled
    );

    const eligiblePrompts = this.getEligiblePrompts(guidedPacks, options);
    
    // For guided prompts, we might want to follow a sequence
    // For now, just use weighted selection like others
    return this.weightedRandomSelect(eligiblePrompts, options.recentPrompts);
  }

  /**
   * Get all prompts that are eligible based on mood and pack settings
   */
  private getEligiblePrompts(packs: PromptPack[], options: SelectionOptions): Prompt[] {
    const allPrompts: Prompt[] = [];

    for (const pack of packs) {
      // Check if pack is enabled for this mood
      if (pack.defaultFor && !pack.defaultFor.includes(options.mood)) {
        continue;
      }

      for (const prompt of pack.items) {
        // Check if prompt is mood-specific and matches current mood
        if (prompt.mood && prompt.mood.length > 0 && !prompt.mood.includes(options.mood)) {
          continue;
        }

        allPrompts.push(prompt);
      }
    }

    return allPrompts;
  }

  /**
   * Filter emergent prompts based on session position
   */
  private filterEmergentByPosition(prompts: Prompt[], options: SelectionOptions): Prompt[] {
    const positionTags: Record<PromptPosition, string[]> = {
      start: ['goal', 'intent', 'commitment', 'preparation'],
      mid: ['breathing', 'posture', 'check-in', 'refocus'],
      distraction: ['return', 're-focus', 'gentle', 'redirect'],
      end: ['retrospective', 'reflection', 'completion', 'next-time']
    };

    const relevantTags = positionTags[options.position] || [];
    
    return prompts.filter(prompt => {
      if (!prompt.tags || prompt.tags.length === 0) return true; // No tags = applies everywhere
      return prompt.tags.some(tag => relevantTags.includes(tag));
    });
  }

  /**
   * Apply intensity weighting to prompts
   */
  private applyIntensityWeighting(prompts: Prompt[], intensity: 'low' | 'standard' | 'high'): Prompt[] {
    const intensityMultipliers = {
      low: 0.5,
      standard: 1.0,
      high: 1.5
    };

    const multiplier = intensityMultipliers[intensity];

    return prompts.map(prompt => ({
      ...prompt,
      weight: (prompt.weight || 1) * multiplier
    }));
  }

  /**
   * Weighted random selection with cooldown logic
   */
  private weightedRandomSelect(prompts: Prompt[], recentPrompts: string[]): Prompt | null {
    if (prompts.length === 0) return null;

    // Filter out recently used prompts (cooldown)
    const availablePrompts = prompts.filter(prompt => 
      !recentPrompts.includes(prompt.id)
    );

    // If all prompts are in cooldown, use the oldest one
    const candidatePrompts = availablePrompts.length > 0 ? availablePrompts : prompts;

    // Calculate total weight
    const totalWeight = candidatePrompts.reduce((sum, prompt) => 
      sum + (prompt.weight || 1), 0
    );

    if (totalWeight === 0) return candidatePrompts[0] || null;

    // Weighted random selection
    let randomWeight = Math.random() * totalWeight;
    
    for (const prompt of candidatePrompts) {
      randomWeight -= (prompt.weight || 1);
      if (randomWeight <= 0) {
        return prompt;
      }
    }

    // Fallback
    return candidatePrompts[candidatePrompts.length - 1] || null;
  }

  /**
   * Future AI hook - placeholder for LLM integration
   */
  async getEmergentPrompt(context: PromptContext): Promise<Prompt | null> {
    // This is where we'd integrate with an LLM in the future
    // For now, return null to fall back to rule-based selection
    
    console.log('AI prompt generation not yet implemented, falling back to rules', {
      mood: context.mood,
      elapsedTime: context.elapsedTime,
      interruptionCount: context.interruptionCount
    });
    
    return null;
  }

  /**
   * Get default prompts for a given position when no packs are available
   */
  getFallbackPrompt(position: PromptPosition, mood: Mood): Prompt {
    const fallbacks: Record<PromptPosition, Record<Mood, string>> = {
      start: {
        DeepWork: "Set **one** measurable goal for this deep work session.",
        CreativeFlow: "What creative challenge will you explore in the next block?",
        LightFocus: "Pick your next small win and commit to it.",
        Learning: "What's the **one** concept you want to master this session?",
        Meditation: "Set an intention for this mindful practice.",
        EnergyBoost: "What energizing action will move you forward?"
      },
      mid: {
        DeepWork: "Midway check: Take 3 deep breaths and return to your goal.",
        CreativeFlow: "Pause. What creative insight is emerging?",
        LightFocus: "Quick check: Are you on track with your small win?",
        Learning: "Reflect: What's clicking about this concept?",
        Meditation: "Notice your breath and return to presence.",
        EnergyBoost: "Feel your energy. What's your next powerful move?"
      },
      distraction: {
        DeepWork: "Noticed a detour? Park it in a note. What's the next tiny step?",
        CreativeFlow: "Gently return to your creative flow. What was inspiring you?",
        LightFocus: "Back to your small win. What's the immediate next action?",
        Learning: "Redirect attention to learning. What were you just discovering?",
        Meditation: "Return to your breath with kindness.",
        EnergyBoost: "Refocus your energy. What matters most right now?"
      },
      end: {
        DeepWork: "Session complete. What moved the needle forward?",
        CreativeFlow: "What creative breakthrough emerged in this session?",
        LightFocus: "Small win achieved! What's the next logical step?",
        Learning: "What's the key insight you'll remember from this session?",
        Meditation: "How do you feel after this mindful practice?",
        EnergyBoost: "What energy will you carry into your next activity?"
      }
    };

    const promptText = fallbacks[position]?.[mood] || "Take a moment to reflect on your progress.";

    return {
      id: `fallback-${position}-${mood}`,
      type: 'emergent',
      text: promptText,
      weight: 1
    };
  }
}

// Export singleton instance
export const promptSelector = new PromptSelector();

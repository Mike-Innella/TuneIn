import { z } from 'zod';
import type { PromptPack, PromptSettings, PromptTelemetry } from '../types/prompts';

// Zod schemas for validation
const PromptSchema = z.object({
  id: z.string(),
  type: z.enum(["manual", "emergent", "guided"]),
  mood: z.array(z.enum(["DeepWork", "CreativeFlow", "LightFocus", "Learning", "Meditation", "EnergyBoost"])).optional(),
  title: z.string().optional(),
  text: z.string(),
  tags: z.array(z.string()).optional(),
  weight: z.number().positive().optional(),
});

const PromptPackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["manual", "emergent", "guided"]),
  items: z.array(PromptSchema),
  enabled: z.boolean(),
  defaultFor: z.array(z.enum(["DeepWork", "CreativeFlow", "LightFocus", "Learning", "Meditation", "EnergyBoost"])).optional(),
});

const PromptSettingsSchema = z.object({
  manualEnabled: z.boolean(),
  emergentEnabled: z.boolean(),
  guidedEnabled: z.boolean(),
  emergentIntensity: z.enum(["low", "standard", "high"]),
  ttsEnabled: z.boolean(),
  defaultTechniques: z.record(z.string()).optional(),
});

const PromptTelemetrySchema = z.object({
  type: z.enum(["manual", "emergent", "guided"]),
  id: z.string(),
  mood: z.enum(["DeepWork", "CreativeFlow", "LightFocus", "Learning", "Meditation", "EnergyBoost"]),
  position: z.enum(["start", "mid", "distraction", "end"]),
  action: z.enum(["shown", "next", "snooze", "tts", "copy"]),
  timestamp: z.number(),
});

// Storage keys
const STORAGE_KEYS = {
  PROMPT_PACKS: 'tunein_prompt_packs',
  PROMPT_SETTINGS: 'tunein_prompt_settings',
  PROMPT_TELEMETRY: 'tunein_prompt_telemetry',
  RECENT_PROMPTS: 'tunein_recent_prompts',
} as const;

// Default settings
const DEFAULT_SETTINGS: PromptSettings = {
  manualEnabled: true,
  emergentEnabled: true,
  guidedEnabled: true,
  emergentIntensity: "standard",
  ttsEnabled: false,
  defaultTechniques: {},
};

class PromptStorage {
  private validateAndParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    try {
      return schema.parse(data);
    } catch (error) {
      console.error('Validation error:', error);
      return null;
    }
  }

  // Prompt Packs
  async getPromptPacks(): Promise<PromptPack[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_PACKS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      const validated = this.validateAndParse(z.array(PromptPackSchema), parsed);
      return (validated || []) as PromptPack[];
    } catch (error) {
      console.error('Error loading prompt packs:', error);
      return [];
    }
  }

  async savePromptPacks(packs: PromptPack[]): Promise<void> {
    try {
      const validated = this.validateAndParse(z.array(PromptPackSchema), packs);
      if (!validated) throw new Error('Invalid prompt packs data');
      
      localStorage.setItem(STORAGE_KEYS.PROMPT_PACKS, JSON.stringify(validated as PromptPack[]));
    } catch (error) {
      console.error('Error saving prompt packs:', error);
      throw error;
    }
  }

  async addPromptPack(pack: PromptPack): Promise<void> {
    const packs = await this.getPromptPacks();
    const existingIndex = packs.findIndex(p => p.id === pack.id);
    
    if (existingIndex >= 0) {
      packs[existingIndex] = pack;
    } else {
      packs.push(pack);
    }
    
    await this.savePromptPacks(packs);
  }

  async removePromptPack(packId: string): Promise<void> {
    const packs = await this.getPromptPacks();
    const filtered = packs.filter(p => p.id !== packId);
    await this.savePromptPacks(filtered);
  }

  async togglePromptPack(packId: string, enabled: boolean): Promise<void> {
    const packs = await this.getPromptPacks();
    const pack = packs.find(p => p.id === packId);
    
    if (pack) {
      pack.enabled = enabled;
      await this.savePromptPacks(packs);
    }
  }

  // Settings
  async getSettings(): Promise<PromptSettings> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;
      
      const parsed = JSON.parse(stored);
      const validated = this.validateAndParse(PromptSettingsSchema, parsed);
      return (validated || DEFAULT_SETTINGS) as PromptSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: PromptSettings): Promise<void> {
    try {
      const validated = this.validateAndParse(PromptSettingsSchema, settings);
      if (!validated) throw new Error('Invalid settings data');
      
      localStorage.setItem(STORAGE_KEYS.PROMPT_SETTINGS, JSON.stringify(validated as PromptSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Recent prompts for cooldown
  async getRecentPrompts(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PROMPTS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading recent prompts:', error);
      return [];
    }
  }

  async addRecentPrompt(promptId: string): Promise<void> {
    try {
      const recent = await this.getRecentPrompts();
      const updated = [promptId, ...recent.filter(id => id !== promptId)].slice(0, 5); // Keep last 5
      localStorage.setItem(STORAGE_KEYS.RECENT_PROMPTS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding recent prompt:', error);
    }
  }

  // Telemetry
  async logTelemetry(event: PromptTelemetry): Promise<void> {
    try {
      const validated = this.validateAndParse(PromptTelemetrySchema, event);
      if (!validated) return;
      
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_TELEMETRY);
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, validated].slice(-100); // Keep last 100 events
      
      localStorage.setItem(STORAGE_KEYS.PROMPT_TELEMETRY, JSON.stringify(updated));
      
      // Also log to console for development
      console.log('[TuneIn Prompts]', event.action, {
        type: event.type,
        id: event.id,
        mood: event.mood,
        position: event.position,
      });
    } catch (error) {
      console.error('Error logging telemetry:', error);
    }
  }

  async getTelemetry(): Promise<PromptTelemetry[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_TELEMETRY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading telemetry:', error);
      return [];
    }
  }

  // Utility for future migration to backend
  async exportData(): Promise<{
    packs: PromptPack[];
    settings: PromptSettings;
    telemetry: PromptTelemetry[];
  }> {
    return {
      packs: await this.getPromptPacks(),
      settings: await this.getSettings(),
      telemetry: await this.getTelemetry(),
    };
  }

  async importData(data: {
    packs?: PromptPack[];
    settings?: PromptSettings;
    telemetry?: PromptTelemetry[];
  }): Promise<void> {
    if (data.packs) await this.savePromptPacks(data.packs);
    if (data.settings) await this.saveSettings(data.settings);
    // Note: We typically wouldn't import telemetry, but the method exists for completeness
  }

  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const promptStorage = new PromptStorage();

// Export for testing or alternative implementations
export { PromptStorage };

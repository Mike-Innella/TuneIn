import type { PromptPack } from '../types/prompts';

export const SeedPacks: PromptPack[] = [
  {
    id: "guided-deepwork",
    name: "Guided · Deep Work (Pomodoro+Prep)",
    type: "guided",
    enabled: true,
    defaultFor: ["DeepWork"],
    items: [
      { 
        id: "g1", 
        type: "guided", 
        text: "Set **one** measurable goal for this session.", 
        tags: ["goal"] 
      },
      { 
        id: "g2", 
        type: "guided", 
        text: "Silence phone & close non-work tabs. 30 seconds.", 
        tags: ["environment"] 
      },
      { 
        id: "g3", 
        type: "guided", 
        text: "At halfway: 4 slow breaths. Shoulders down.", 
        tags: ["breathing"] 
      },
      { 
        id: "g4", 
        type: "guided", 
        text: "If drifted: pick the **very next** atomic action.", 
        tags: ["re-focus"] 
      },
      { 
        id: "g5", 
        type: "guided", 
        text: "End: one-line log—What moved the needle?", 
        tags: ["retrospective"] 
      }
    ]
  },
  {
    id: "guided-creative",
    name: "Guided · Creative Flow",
    type: "guided",
    enabled: true,
    defaultFor: ["CreativeFlow"],
    items: [
      { 
        id: "gc1", 
        type: "guided", 
        text: "What creative question will you explore this session?", 
        tags: ["goal", "creativity"] 
      },
      { 
        id: "gc2", 
        type: "guided", 
        text: "Clear your space. Light, music, tools—set the scene.", 
        tags: ["environment"] 
      },
      { 
        id: "gc3", 
        type: "guided", 
        text: "Mid-session: What unexpected direction is emerging?", 
        tags: ["check-in", "creativity"] 
      },
      { 
        id: "gc4", 
        type: "guided", 
        text: "Stuck? Try the opposite approach or change perspective.", 
        tags: ["re-focus", "creativity"] 
      },
      { 
        id: "gc5", 
        type: "guided", 
        text: "Capture your breakthrough—what surprised you?", 
        tags: ["retrospective", "creativity"] 
      }
    ]
  },
  {
    id: "guided-learning",
    name: "Guided · Learning & Study",
    type: "guided",
    enabled: true,
    defaultFor: ["Learning"],
    items: [
      { 
        id: "gl1", 
        type: "guided", 
        text: "What **one** concept will you master this session?", 
        tags: ["goal", "learning"] 
      },
      { 
        id: "gl2", 
        type: "guided", 
        text: "Active mode: notebook ready, teach-back prepared.", 
        tags: ["environment", "learning"] 
      },
      { 
        id: "gl3", 
        type: "guided", 
        text: "Halfway check: Explain the concept in simple terms.", 
        tags: ["check-in", "learning"] 
      },
      { 
        id: "gl4", 
        type: "guided", 
        text: "Confused? Find one concrete example or analogy.", 
        tags: ["re-focus", "learning"] 
      },
      { 
        id: "gl5", 
        type: "guided", 
        text: "Test: Teach this concept to an imaginary student.", 
        tags: ["retrospective", "learning"] 
      }
    ]
  },
  {
    id: "emergent-core",
    name: "Emergent · Core",
    type: "emergent",
    enabled: true,
    items: [
      { 
        id: "e1", 
        type: "emergent", 
        mood: ["DeepWork", "CreativeFlow"], 
        text: "Pick your **single task** for the next block and commit to it.", 
        weight: 3,
        tags: ["goal", "commitment"]
      },
      { 
        id: "e2", 
        type: "emergent", 
        text: "Midway check: relax jaw, breathe out slowly for 6.", 
        tags: ["breathing", "posture"], 
        weight: 2 
      },
      { 
        id: "e3", 
        type: "emergent", 
        text: "Noticed a detour? Park it in a note. Return to the next tiny substep.", 
        tags: ["re-focus", "redirect"], 
        weight: 3 
      },
      { 
        id: "e4", 
        type: "emergent", 
        text: "One-line wrap: What will you start with next time?", 
        tags: ["retrospective", "next-time"], 
        weight: 2 
      },
      { 
        id: "e5", 
        type: "emergent", 
        mood: ["Learning"], 
        text: "Connect this to something you already know well.", 
        tags: ["learning", "connection"], 
        weight: 2 
      },
      { 
        id: "e6", 
        type: "emergent", 
        mood: ["Meditation"], 
        text: "Notice the space between your thoughts.", 
        tags: ["mindfulness", "breathing"], 
        weight: 2 
      },
      { 
        id: "e7", 
        type: "emergent", 
        mood: ["EnergyBoost"], 
        text: "What bold action would energize you right now?", 
        tags: ["energy", "motivation"], 
        weight: 3 
      }
    ]
  },
  {
    id: "emergent-focus",
    name: "Emergent · Focus Rescue",
    type: "emergent",
    enabled: true,
    items: [
      { 
        id: "ef1", 
        type: "emergent", 
        text: "Distracted? Name it: \"I notice I'm thinking about ___\"", 
        tags: ["distraction", "mindfulness"], 
        weight: 3 
      },
      { 
        id: "ef2", 
        type: "emergent", 
        text: "Return gently. What's the smallest possible next step?", 
        tags: ["return", "gentle", "micro-task"], 
        weight: 3 
      },
      { 
        id: "ef3", 
        type: "emergent", 
        text: "Feeling scattered? 4-7-8 breath: inhale 4, hold 7, exhale 8.", 
        tags: ["breathing", "scattered"], 
        weight: 2 
      },
      { 
        id: "ef4", 
        type: "emergent", 
        text: "Set a micro-timer: 2 minutes on just this one thing.", 
        tags: ["micro-task", "timer"], 
        weight: 2 
      },
      { 
        id: "ef5", 
        type: "emergent", 
        text: "Is this the right task? Maybe something urgent needs attention first.", 
        tags: ["priority", "check-in"], 
        weight: 1 
      }
    ]
  },
  {
    id: "manual-classics",
    name: "Manual · Classic Phrases",
    type: "manual",
    enabled: true,
    items: [
      { 
        id: "m1", 
        type: "manual", 
        text: "\"Do the next non-optional thing.\"" 
      },
      { 
        id: "m2", 
        type: "manual", 
        text: "\"Don't break the chain.\" 25 clean minutes.", 
        mood: ["LightFocus", "DeepWork"] 
      },
      { 
        id: "m3", 
        type: "manual", 
        text: "\"Progress, not perfection.\"" 
      },
      { 
        id: "m4", 
        type: "manual", 
        text: "\"One breath, one step, one moment.\"" 
      },
      { 
        id: "m5", 
        type: "manual", 
        text: "\"What would I do if I weren't afraid?\"", 
        mood: ["CreativeFlow", "EnergyBoost"] 
      }
    ]
  },
  {
    id: "manual-motivation",
    name: "Manual · Motivation Boosters",
    type: "manual",
    enabled: true,
    defaultFor: ["EnergyBoost"],
    items: [
      { 
        id: "mm1", 
        type: "manual", 
        text: "Your future self is counting on this moment." 
      },
      { 
        id: "mm2", 
        type: "manual", 
        text: "Small actions create compound results." 
      },
      { 
        id: "mm3", 
        type: "manual", 
        text: "Discipline is choosing between what you want now and what you want most." 
      },
      { 
        id: "mm4", 
        type: "manual", 
        text: "You've overcome challenges before. This is just another one." 
      },
      { 
        id: "mm5", 
        type: "manual", 
        text: "Excellence is not an act, but a habit." 
      }
    ]
  }
];

// Helper function to initialize storage with seed data
export async function initializeSeedData() {
  const { promptStorage } = await import('../lib/prompt-storage');
  
  try {
    const existingPacks = await promptStorage.getPromptPacks();
    
    // Only add seed data if no packs exist
    if (existingPacks.length === 0) {
      console.log('Initializing TuneIn with seed prompt packs...');
      await promptStorage.savePromptPacks(SeedPacks);
      console.log('Seed prompt packs initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing seed data:', error);
  }
}

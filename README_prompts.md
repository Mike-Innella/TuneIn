# TuneIn Prompts System

The TuneIn Prompts System provides contextual, adaptive prompts during focus sessions to help users maintain concentration and achieve their goals. The system includes three types of prompts: Manual, Emergent, and Guided.

## Architecture Overview

### Core Components

- **Types & Interfaces** (`src/types/prompts.ts`) - TypeScript definitions for all prompt-related data structures
- **Storage Layer** (`src/lib/prompt-storage.ts`) - localStorage abstraction with Zod validation, ready for backend migration
- **Selection Engine** (`src/lib/prompt-selector.ts`) - Weighted random selection with cooldown logic and mood filtering
- **Hook** (`src/hooks/usePrompts.ts`) - React hook managing session lifecycle and prompt triggers
- **UI Components** - PromptPill (collapsed view) and PromptDrawer (expanded view with actions)

### Prompt Types

#### Manual Prompts
- User-created or predefined motivational phrases
- Examples: "Do the next non-optional thing", "Progress, not perfection"
- Simple text-based reminders and affirmations

#### Emergent Prompts
- Rule-based adaptive prompts that respond to session context
- Filtered by session position (start, mid, distraction, end)
- Weighted selection based on user behavior and interruption patterns
- Future AI integration hook available (`getEmergentPrompt`)

#### Guided Prompts
- Structured technique-based prompts (Pomodoro, Deep Work, etc.)
- Sequential steps that guide users through proven productivity methods
- Customizable per mood and session type

## Session Integration

### Trigger Points

- **Session Start** (T+0): Goal-setting and preparation prompts
- **Midpoint** (50% of session duration): Check-in and breathing reminders
- **Distraction Detection**: 
  - Tab hidden > 10 seconds
  - Timer paused > 30 seconds
- **Session End** (T=0): Reflection and planning for next session

### Context Awareness

The system tracks:
- Current mood (DeepWork, CreativeFlow, LightFocus, etc.)
- Session duration and elapsed time
- Interruption count and patterns
- Recent prompts (cooldown to prevent repetition)
- Pause/resume behavior

## Data Model

```typescript
interface Prompt {
  id: string;
  type: 'manual' | 'emergent' | 'guided';
  text: string;           // Markdown supported
  mood?: Mood[];          // Optional mood filtering
  tags?: string[];        // For context filtering
  weight?: number;        // For weighted selection
}

interface PromptPack {
  id: string;
  name: string;
  type: PromptType;
  items: Prompt[];
  enabled: boolean;
  defaultFor?: Mood[];    // Auto-enable for specific moods
}
```

## UI Components

### PromptPill (Collapsed View)
- Appears near timer during sessions
- Shows truncated text (≤140 chars)
- Type badge and position indicator
- Expand/hide actions
- Auto-fades after 10 seconds

### PromptDrawer (Expanded View)
- Full markdown text rendering
- Action buttons: Show Another, Snooze, Copy, TTS
- Keyboard shortcuts (Esc to hide, N for next)
- Accessibility compliant (ARIA, focus management)

## Settings & Customization

Users can control:
- Enable/disable each prompt type
- Emergent intensity (Low/Standard/High)
- TTS on/off
- Default techniques per mood
- Custom prompt pack creation

## Storage & Migration

- **Current**: localStorage with Zod validation
- **Migration Ready**: Thin repository layer supports easy backend integration
- **Data Export/Import**: Built-in functions for data portability
- **Telemetry**: Event logging for prompt effectiveness analysis

## Accessibility Features

- ARIA live regions for screen readers
- Keyboard navigation support
- Respects `prefers-reduced-motion`
- High contrast color schemes
- Focus management for drawer interactions

## Extension Points

### AI Integration
```typescript
// Future LLM integration hook
async getEmergentPrompt(context: PromptContext): Promise<Prompt | null>
```

### Custom Algorithms
The selection engine is modular - new selection strategies can be added by extending the `PromptSelector` class.

### Backend Integration
The storage layer uses async methods and can be easily swapped for API calls:

```typescript
// Replace localStorage with API calls
class ApiPromptStorage implements PromptStorageInterface {
  async getPromptPacks(): Promise<PromptPack[]> {
    return await api.get('/prompt-packs');
  }
  // ... other methods
}
```

## Performance Considerations

- Prompts load asynchronously on app init
- Lightweight selection algorithms (O(n) complexity)
- Efficient cooldown tracking (max 5 recent prompts)
- Minimal re-renders through careful state management

## Development Guidelines

### Adding New Prompt Types
1. Extend the `PromptType` union in types
2. Add selection logic in `PromptSelector`
3. Update UI components to handle new type
4. Add seed data and tests

### Creating Prompt Packs
Use the seed data format in `src/data/seed-prompts.ts` as a template:

```typescript
{
  id: "unique-pack-id",
  name: "Pack Display Name",
  type: "manual" | "emergent" | "guided",
  enabled: true,
  defaultFor: ["DeepWork"], // Optional
  items: [
    {
      id: "unique-prompt-id",
      type: "manual",
      text: "Your prompt text here",
      tags: ["motivation"], // Optional
      weight: 2 // Optional, default 1
    }
  ]
}
```

## Testing

The system includes:
- Zod schema validation for runtime type safety
- Selection algorithm tests (cooldown, weights, filtering)
- Storage layer integration tests
- Component accessibility tests

## Future Enhancements

- Real-time LLM integration
- Cross-device sync
- Advanced telemetry and insights
- Community prompt sharing
- Voice-activated interactions
- Integration with calendar/task systems

---

The TuneIn Prompts System is designed to be unobtrusive yet powerful, helping users maintain focus while providing the flexibility to adapt to different working styles and preferences.

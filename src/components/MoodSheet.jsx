import { Sheet } from "./Sheet";
import { useUIState } from "../state/ui";
import { useIsMobile } from "../hooks/use-mobile";
import { Brain, Lightbulb, CheckCircle, BookOpen, Heart, Zap } from "lucide-react";

const MOODS = [
  {
    id: 1,
    name: 'Deep Work',
    slug: 'deep-work',
    description: 'Intense concentration for complex cognitive tasks',
    icon: Brain,
    default_session_duration: 50,
    promptMood: 'DeepWork'
  },
  {
    id: 2,
    name: 'Creative Flow',
    slug: 'creative-flow',
    description: 'Inspiration and ideation for creative work',
    icon: Lightbulb,
    default_session_duration: 45,
    promptMood: 'CreativeFlow'
  },
  {
    id: 3,
    name: 'Light Focus',
    slug: 'light-focus',
    description: 'Moderate concentration for routine tasks',
    icon: CheckCircle,
    default_session_duration: 25,
    promptMood: 'LightFocus'
  },
  {
    id: 4,
    name: 'Learning',
    slug: 'learning',
    description: 'Enhanced retention and comprehension',
    icon: BookOpen,
    default_session_duration: 30,
    promptMood: 'Learning'
  },
  {
    id: 5,
    name: 'Meditation',
    slug: 'meditation',
    description: 'Mindfulness and stress reduction',
    icon: Heart,
    default_session_duration: 20,
    promptMood: 'Meditation'
  },
  {
    id: 6,
    name: 'Energy Boost',
    slug: 'energy-boost',
    description: 'Motivation and drive for challenging tasks',
    icon: Zap,
    default_session_duration: 35,
    promptMood: 'EnergyBoost'
  }
];

export function MoodSheet({ onMoodSelect }) {
  const isMobile = useIsMobile();
  const [uiState, updateUIState] = useUIState();

  if (!isMobile) return null;

  const isOpen = uiState.moodSheetOpen;

  const handleClose = () => {
    updateUIState({ moodSheetOpen: false });
  };

  const handleMoodSelect = (mood) => {
    updateUIState({ 
      moodSheetOpen: false,
      lastMood: mood.name,
      lastTimerDuration: mood.default_session_duration
    });
    
    // Dispatch mood selection event
    window.dispatchEvent(new CustomEvent("mood:selected", {
      detail: { 
        mood: mood.name, 
        duration: mood.default_session_duration 
      }
    }));
    
    onMoodSelect?.(mood);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Choose Your Mood"
      allowSwipeClose={true}
    >
      <div className="p-4 space-y-4">
        <p className="text-sm text-app-text-muted mb-6">
          Select a focus state to customize your session duration and music.
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className="tap-target p-4 rounded-xl surface border border-app-border hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-app-text">
                        {mood.name}
                      </h3>
                      <span className="text-sm text-app-text-muted">
                        {mood.default_session_duration}m
                      </span>
                    </div>
                    <p className="text-sm text-app-text-muted mt-1">
                      {mood.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-app-border">
          <p className="text-xs text-app-text-muted text-center">
            Your selection will be saved and automatically applied to future sessions.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
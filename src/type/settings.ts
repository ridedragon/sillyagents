export type AgentRole = 'creator' | 'critic' | 'editor' | 'finalizer';

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  systemPrompt: string;
  useCustomPreset: boolean;
  customPresetName?: string;
  enabled: boolean;
}

export interface AgentState {
  id: string;
  status: 'idle' | 'thinking' | 'generating' | 'completed' | 'error';
  output: string;
  score?: number;
  feedback?: string;
  startTime?: number;
  endTime?: number;
}

export type WorkflowMode = 'sequential' | 'parallel' | 'hybrid';

export interface WorkflowConfig {
  mode: WorkflowMode;
  topic: string;
  maxIterations: number;
  enableScoring: boolean;
  enableFeedback: boolean;
}

export type Settings = z.infer<typeof Settings>;
export const Settings = z
  .object({
    agents: z.array(z.any()).default([]),
    workflow: z.object({
      mode: z.enum(['sequential', 'parallel', 'hybrid']).default('hybrid'),
      topic: z.string().default(''),
      maxIterations: z.number().default(3),
      enableScoring: z.boolean().default(true),
      enableFeedback: z.boolean().default(true),
    }),
  })
  .prefault({});

export const setting_field = 'sillyagents';

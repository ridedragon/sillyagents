import { ref, computed } from 'vue';
import type { AgentConfig, AgentState, WorkflowConfig } from '@/type/settings';

export function useAgentWorkflow() {
  const agents = ref<AgentConfig[]>([]);
  const agentStates = ref<AgentState[]>([]);
  const workflowConfig = ref<WorkflowConfig>({
    mode: 'hybrid',
    topic: '',
    maxIterations: 3,
    enableScoring: true,
    enableFeedback: true,
  });
  const isRunning = ref(false);
  const currentIteration = ref(0);
  const finalOutput = ref('');
  const logs = ref<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    logs.value.push(`[${timestamp}] ${message}`);
  };

  const initializeAgents = (configs: AgentConfig[]) => {
    agents.value = configs;
    agentStates.value = configs.map(config => ({
      id: config.id,
      status: 'idle',
      output: '',
    }));
    addLog('Agents initialized');
  };

  const updateAgentState = (agentId: string, updates: Partial<AgentState>) => {
    const index = agentStates.value.findIndex(state => state.id === agentId);
    if (index !== -1) {
      agentStates.value[index] = { ...agentStates.value[index], ...updates };
    }
  };

  const getAgentConfig = (agentId: string) => {
    return agents.value.find(agent => agent.id === agentId);
  };

  const getAgentState = (agentId: string) => {
    return agentStates.value.find(state => state.id === agentId);
  };

  const enabledAgents = computed(() => agents.value.filter(agent => agent.enabled));

  const resetWorkflow = () => {
    agentStates.value.forEach(state => {
      state.status = 'idle';
      state.output = '';
      state.score = undefined;
      state.feedback = undefined;
      state.startTime = undefined;
      state.endTime = undefined;
    });
    currentIteration.value = 0;
    finalOutput.value = '';
    logs.value = [];
    isRunning.value = false;
    addLog('Workflow reset');
  };

  return {
    agents,
    agentStates,
    workflowConfig,
    isRunning,
    currentIteration,
    finalOutput,
    logs,
    enabledAgents,
    addLog,
    initializeAgents,
    updateAgentState,
    getAgentConfig,
    getAgentState,
    resetWorkflow,
  };
}

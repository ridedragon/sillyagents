import { AgentConfig, setting_field, Settings } from '@/type/settings';
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

const defaultAgents: AgentConfig[] = [
  {
    id: 'creator-1',
    name: '创意作家',
    role: 'creator',
    systemPrompt: '你是一位富有创意的作家，擅长创作引人入胜的故事和对话。请根据主题创作出精彩的内容。',
    useCustomPreset: false,
    enabled: true,
  },
  {
    id: 'critic-1',
    name: '评论家',
    role: 'critic',
    systemPrompt: '你是一位专业的文学评论家，擅长分析作品的优缺点。请对其他Agent的创作进行客观评价，给出1-10分的评分和详细的反馈。',
    useCustomPreset: false,
    enabled: true,
  },
  {
    id: 'editor-1',
    name: '编辑',
    role: 'editor',
    systemPrompt: '你是一位经验丰富的编辑，擅长修改和完善作品。请根据评论家的反馈，对创作内容进行优化和改进。',
    useCustomPreset: false,
    enabled: true,
  },
  {
    id: 'finalizer-1',
    name: '最终整合者',
    role: 'finalizer',
    systemPrompt: '你是一位总编，负责整合所有Agent的工作成果。请综合所有创作、评论和修改，生成一份最终的完美版本。',
    useCustomPreset: false,
    enabled: true,
  },
];

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(validateInplace(Settings, _.get(extension_settings, setting_field)));

  const ensureDefaultAgents = () => {
    if (!settings.value.agents || settings.value.agents.length === 0) {
      settings.value.agents = defaultAgents;
    }
  };

  ensureDefaultAgents();

  watch(
    settings,
    new_settings => {
      _.set(extension_settings, setting_field, klona(new_settings));
      saveSettingsDebounced();
    },
    { deep: true },
  );

  const addAgent = (agent: AgentConfig) => {
    settings.value.agents.push(agent);
  };

  const removeAgent = (agentId: string) => {
    const index = settings.value.agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      settings.value.agents.splice(index, 1);
    }
  };

  const updateAgent = (agentId: string, updates: Partial<AgentConfig>) => {
    const index = settings.value.agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      settings.value.agents[index] = { ...settings.value.agents[index], ...updates };
    }
  };

  return {
    settings,
    addAgent,
    removeAgent,
    updateAgent,
  };
});

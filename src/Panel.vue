<template>
  <div class="sillyagents-panel">
    <div class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b>{{ t`SillyAgents - 多Agent协作创作` }}</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content">
        <div class="workflow-section">
          <h3>{{ t`工作流配置` }}</h3>
          <div class="flex-container">
            <label for="topic">{{ t`创作主题` }}:</label>
            <input
              id="topic"
              v-model="workflowConfig.topic"
              type="text"
              :placeholder="t`请输入创作主题...`"
              class="text_pole"
            />
          </div>
          <div class="flex-container">
            <label for="workflow-mode">{{ t`工作模式` }}:</label>
            <select id="workflow-mode" v-model="workflowConfig.mode">
              <option value="sequential">{{ t`顺序创作` }}</option>
              <option value="parallel">{{ t`并行创作` }}</option>
              <option value="hybrid">{{ t`混合模式` }}</option>
            </select>
          </div>
          <div class="flex-container">
            <label for="iterations">{{ t`最大迭代次数` }}:</label>
            <input
              id="iterations"
              v-model.number="workflowConfig.maxIterations"
              type="number"
              min="1"
              max="10"
            />
          </div>
          <div class="flex-container">
            <input id="enable-scoring" v-model="workflowConfig.enableScoring" type="checkbox" />
            <label for="enable-scoring">{{ t`启用评分` }}</label>
          </div>
          <div class="flex-container">
            <input id="enable-feedback" v-model="workflowConfig.enableFeedback" type="checkbox" />
            <label for="enable-feedback">{{ t`启用反馈` }}</label>
          </div>
        </div>

        <hr class="sysHR" />

        <div class="agents-section">
          <h3>{{ t`Agent配置` }}</h3>
          <div class="agents-list">
            <div v-for="agent in settings.agents" :key="agent.id" class="agent-card">
              <div class="agent-header">
                <input v-model="agent.enabled" type="checkbox" :id="`agent-enabled-${agent.id}`" />
                <label :for="`agent-enabled-${agent.id}`" class="agent-name">{{ agent.name }}</label>
                <span class="agent-role" :class="`role-${agent.role}`">{{ getRoleLabel(agent.role) }}</span>
              </div>
              <div class="agent-config">
                <div class="flex-container">
                  <label>{{ t`系统提示词` }}:</label>
                </div>
                <textarea
                  v-model="agent.systemPrompt"
                  :placeholder="t`输入该Agent的系统提示词...`"
                  class="text_pole textarea_compact"
                  rows="3"
                ></textarea>
                <div class="flex-container">
                  <input v-model="agent.useCustomPreset" type="checkbox" :id="`custom-preset-${agent.id}`" />
                  <label :for="`custom-preset-${agent.id}`">{{ t`使用自定义预设` }}</label>
                </div>
                <div v-if="agent.useCustomPreset" class="flex-container">
                  <label>{{ t`预设名称` }}:</label>
                  <input v-model="agent.customPresetName" type="text" class="text_pole" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="sysHR" />

        <div class="control-section">
          <div class="flex-container">
            <input
              class="menu_button"
              type="submit"
              :value="t`开始创作`"
              @click="startWorkflow"
              :disabled="workflow.isRunning"
            />
            <input
              class="menu_button"
              type="submit"
              :value="t`停止`"
              @click="stopWorkflow"
              :disabled="!workflow.isRunning"
            />
            <input
              class="menu_button"
              type="submit"
              :value="t`重置`"
              @click="resetWorkflow"
            />
          </div>
        </div>

        <hr class="sysHR" />

        <div class="workspace-section" v-if="workflow.isRunning || workflow.logs.length > 0">
          <h3>{{ t`工作区` }}</h3>
          <div class="logs-container">
            <div v-for="(log, index) in workflow.logs" :key="index" class="log-entry">
              {{ log }}
            </div>
          </div>
          <div class="agent-statuses">
            <div v-for="state in workflow.agentStates" :key="state.id" class="agent-status">
              <div class="status-header">
                <span class="agent-name">{{ getAgentName(state.id) }}</span>
                <span class="status-badge" :class="`status-${state.status}`">
                  {{ getStatusLabel(state.status) }}
                </span>
              </div>
              <div v-if="state.output" class="agent-output">
                <h4>{{ t`输出` }}:</h4>
                <p>{{ state.output }}</p>
              </div>
              <div v-if="state.score !== undefined" class="agent-score">
                <span>{{ t`评分` }}: {{ state.score }}/10</span>
              </div>
              <div v-if="state.feedback" class="agent-feedback">
                <h4>{{ t`反馈` }}:</h4>
                <p>{{ state.feedback }}</p>
              </div>
            </div>
          </div>
          <div v-if="workflow.finalOutput" class="final-output">
            <h3>{{ t`最终结果` }}</h3>
            <div class="final-output-content">
              {{ workflow.finalOutput }}
            </div>
            <div class="flex-container">
              <input
                class="menu_button"
                type="submit"
                :value="t`发送到酒馆`"
                @click="sendToTavern"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { useAgentWorkflow } from '@/composable/useAgentWorkflow';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { AgentConfig, AgentRole, AgentState } from '@/type/settings';

const { settings } = storeToRefs(useSettingsStore());
const workflow = useAgentWorkflow();

const workflowConfig = computed({
  get: () => settings.value.workflow,
  set: (value) => {
    settings.value.workflow = value;
  },
});

const roleLabels: Record<AgentRole, string> = {
  creator: '创作者',
  critic: '评论家',
  editor: '编辑',
  finalizer: '整合者',
};

const statusLabels: Record<AgentState['status'], string> = {
  idle: '空闲',
  thinking: '思考中',
  generating: '生成中',
  completed: '已完成',
  error: '错误',
};

const getRoleLabel = (role: AgentRole) => roleLabels[role];
const getStatusLabel = (status: AgentState['status']) => statusLabels[status];

const getAgentName = (agentId: string) => {
  const agent = settings.value.agents.find(a => a.id === agentId);
  return agent?.name || agentId;
};

const startWorkflow = async () => {
  if (!workflowConfig.value.topic) {
    toastr.warning(t`请先输入创作主题！`);
    return;
  }

  workflow.initializeAgents(settings.value.agents);
  workflow.workflowConfig = { ...workflowConfig.value };
  workflow.isRunning = true;
  workflow.addLog(t`开始创作流程...`);
  toastr.success(t`创作流程已启动！`);

  await runDemoWorkflow();
};

const runDemoWorkflow = async () => {
  const enabledAgents = settings.value.agents.filter(a => a.enabled);

  for (const agent of enabledAgents) {
    workflow.updateAgentState(agent.id, { status: 'thinking', startTime: Date.now() });
    workflow.addLog(`${agent.name} 正在思考...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    workflow.updateAgentState(agent.id, { status: 'generating' });
    workflow.addLog(`${agent.name} 正在生成内容...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const demoOutput = `这是 ${agent.name} 的示例输出。主题：${workflowConfig.value.topic}`;
    workflow.updateAgentState(agent.id, {
      status: 'completed',
      output: demoOutput,
      score: agent.role === 'critic' ? 8 : undefined,
      feedback: agent.role === 'critic' ? '这是一条示例反馈。' : undefined,
      endTime: Date.now(),
    });
    workflow.addLog(`${agent.name} 已完成！`);
  }

  workflow.finalOutput = `这是整合后的最终结果。\n\n主题：${workflowConfig.value.topic}\n\n（实际使用时会调用真实的AI生成）`;
  workflow.isRunning = false;
  workflow.addLog(t`创作流程已完成！`);
  toastr.success(t`创作完成！`);
};

const stopWorkflow = () => {
  workflow.isRunning = false;
  workflow.addLog(t`创作流程已停止。`);
  toastr.info(t`已停止创作流程。`);
};

const resetWorkflow = () => {
  workflow.resetWorkflow();
  toastr.info(t`工作区已重置。`);
};

const sendToTavern = () => {
  if (!workflow.finalOutput) {
    toastr.warning(t`没有最终结果可发送！`);
    return;
  }

  const context = SillyTavern.getContext();
  if (context && context.chat) {
    context.chat.push({
      is_user: false,
      name: 'SillyAgents',
      send_date: Date.now(),
      mes: workflow.finalOutput,
    });
    toastr.success(t`已发送到酒馆！`);
  } else {
    toastr.error(t`无法访问酒馆聊天！`);
  }
};
</script>

<style scoped>
.sillyagents-panel h3 {
  margin: 10px 0;
  font-weight: bold;
}

.workflow-section,
.agents-section,
.control-section,
.workspace-section {
  margin-bottom: 15px;
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-name {
  font-weight: bold;
  flex-grow: 1;
}

.agent-role {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.role-creator {
  background: #4caf50;
  color: white;
}

.role-critic {
  background: #ff9800;
  color: white;
}

.role-editor {
  background: #2196f3;
  color: white;
}

.role-finalizer {
  background: #9c27b0;
  color: white;
}

.agent-config {
  padding-left: 25px;
}

.logs-container {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.log-entry {
  font-family: monospace;
  font-size: 12px;
  margin: 2px 0;
}

.agent-statuses {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.agent-status {
  border: 1px solid #666;
  border-radius: 5px;
  padding: 10px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.status-idle {
  background: #9e9e9e;
  color: white;
}

.status-thinking {
  background: #ffeb3b;
  color: black;
}

.status-generating {
  background: #03a9f4;
  color: white;
}

.status-completed {
  background: #4caf50;
  color: white;
}

.status-error {
  background: #f44336;
  color: white;
}

.agent-output,
.agent-feedback {
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.agent-score {
  font-weight: bold;
  color: #ff9800;
}

.final-output {
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 15px;
  background: rgba(76, 175, 80, 0.1);
}

.final-output-content {
  white-space: pre-wrap;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin: 10px 0;
}
</style>

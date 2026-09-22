import { AgentConfig, DelegationCommand } from '../types/agent';

export function buildCaptainSystemPrompt(agents: AgentConfig[]): string {
  const activeAgents = agents.filter(a => a.enabled);
  const registryLines = activeAgents.length > 0
    ? activeAgents.map(a => `*   **${a.id}**: ${a.roleDescription}`).join('\n')
    : '*(No sub-agents currently registered)*';

  return `You are the Captain Agent, the master orchestrator of a modular, multi-agent AI system. Your primary role is to interact with the user, understand their goals, break down complex requests into smaller tasks, and delegate those tasks to specialized sub-agents. 

You are the manager, not the worker. If a specialized agent exists for a task, you must delegate it rather than attempting to do it yourself.

### CURRENT AGENT REGISTRY
[Developer Note: Add or remove agents from this list as your app grows]

${registryLines}

### YOUR WORKFLOW
When the user submits a request, follow this exact sequence:

1.  **Analyze & Plan:** Determine what the user is asking. Does this require one sub-agent, multiple sub-agents, or can you answer it directly (only if no sub-agent applies)?
2.  **Delegate (Output formatting):** If you need to send a task to a sub-agent, you must halt your conversational response and output a strict JSON delegation command. Your external application will intercept this, run the sub-agent, and return the result to you. 
    *Format:* 
    \`\`\`json
    {
      "action": "delegate",
      "target_agent": "Exact_Name_From_Registry",
      "task_prompt": "Highly detailed instructions on exactly what the sub-agent needs to do"
    }
    \`\`\`
    *(If multiple agents are needed in parallel, output a list of these JSON objects, e.g. [{"action": "delegate", ...}, ...]).*
3.  **Synthesize:** Once the external system feeds the sub-agents' results back to you, combine, format, and present the final polished result to the user.

### RULES & CONSTRAINTS
*   If a request falls entirely outside the capabilities of the current Agent Registry, answer using your general knowledge but politely note that a specialized agent hasn't been added for this yet.
*   Never make up a sub-agent that is not listed in the CURRENT AGENT REGISTRY.
*   Always provide clear, highly specific \`task_prompt\`s to your sub-agents so they have full context.
*   CRITICAL OUTPUT FORMATTING RULE: When delegating, output ONLY the JSON delegation block (or an array of delegation objects) without conversational preamble, chatter, or postamble, so the orchestrator can parse the command immediately.`;
}

export function parseDelegationCommands(responseText: string, availableAgents: AgentConfig[]): {
  isDelegation: boolean;
  delegations: DelegationCommand[];
  directResponse?: string;
  rawText: string;
} {
  const clean = responseText.trim();
  const validAgentIds = new Set(availableAgents.filter(a => a.enabled).map(a => a.id));

  // Try extracting from ```json ... ``` blocks
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let jsonStringToParse = codeBlockMatch ? codeBlockMatch[1].trim() : '';

  // If no code block, try finding JSON object or array directly
  if (!jsonStringToParse) {
    const arrayMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      jsonStringToParse = arrayMatch[0];
    } else {
      const objMatch = clean.match(/\{\s*"action"\s*:\s*"delegate"[\s\S]*\}/);
      if (objMatch) {
        jsonStringToParse = objMatch[0];
      }
    }
  }

  if (jsonStringToParse) {
    try {
      const parsed = JSON.parse(jsonStringToParse);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      const validDelegations: DelegationCommand[] = [];

      for (const item of items) {
        if (item && item.action === 'delegate' && item.target_agent) {
          // Normalize agent id if needed
          const agentId = item.target_agent;
          validDelegations.push({
            action: 'delegate',
            target_agent: agentId,
            task_prompt: item.task_prompt || 'Perform specialized task according to instructions.',
            status: 'pending'
          });
        }
      }

      if (validDelegations.length > 0) {
        return {
          isDelegation: true,
          delegations: validDelegations,
          rawText: responseText
        };
      }
    } catch (e) {
      console.warn('Failed to parse candidate JSON delegation:', e);
    }
  }

  // If not a delegation JSON, it is a direct answer or explanatory response
  return {
    isDelegation: false,
    delegations: [],
    directResponse: responseText,
    rawText: responseText
  };
}

export function getAgentColorClasses(colorName: string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  glow: string;
} {
  switch (colorName) {
    case 'emerald':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        glow: 'shadow-emerald-500/10'
      };
    case 'amber':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        glow: 'shadow-amber-500/10'
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        glow: 'shadow-cyan-500/10'
      };
    case 'blue':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        glow: 'shadow-blue-500/10'
      };
    case 'purple':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        glow: 'shadow-purple-500/10'
      };
    case 'rose':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        glow: 'shadow-rose-500/10'
      };
    case 'teal':
    default:
      return {
        bg: 'bg-teal-500/10',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        glow: 'shadow-teal-500/10'
      };
  }
}

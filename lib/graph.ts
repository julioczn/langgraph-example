import {
  AIMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ERROR_MESSAGES, SYSTEM_PROMPT } from "./prompts";
import { validateIrpfTool, validateProofOfResidenceTool } from "./tools";

const aiModel = process.env.AI_MODEL || "gemini-2.5-flash";

const model = new ChatGoogleGenerativeAI({
  model: aiModel,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

const tools = [validateIrpfTool, validateProofOfResidenceTool];

const modelWithTools = model.bindTools(tools);

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  fileStorage: Annotation<Record<string, string>>({
    reducer: (_, newValue) => newValue || {},
    default: () => ({}),
  }),
});

function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }

  return "__end__";
}

async function callModel(state: typeof StateAnnotation.State) {
  console.log("callModel: Starting with", state.messages.length, "messages");
  const messages = state.messages;

  const totalLength = messages.reduce(
    (acc, msg) =>
      acc + (typeof msg.content === "string" ? msg.content.length : 0),
    0
  );
  console.log("callModel: Total context length:", totalLength, "characters");

  const systemMessage = new SystemMessage(SYSTEM_PROMPT);

  console.log("callModel: Invoking model...");
  try {
    const response = await modelWithTools.invoke([systemMessage, ...messages]);
    console.log("callModel: Model responded");
    console.log("callModel: Tool calls:", response.tool_calls?.length || 0);

    return { messages: [response] };
  } catch (error) {
    console.error("callModel: Error invoking model:", error);
    throw error;
  }
}

async function callTools(state: typeof StateAnnotation.State) {
  console.log("callTools: Executing tools with file storage");
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const toolCalls = lastMessage.tool_calls || [];

  const toolMessages: ToolMessage[] = [];

  for (const toolCall of toolCalls) {
    console.log("callTools: Executing tool:", toolCall.name);

    const tool = tools.find((t) => t.name === toolCall.name);
    if (!tool) {
      console.error("callTools: Tool not found:", toolCall.name);
      toolMessages.push(
        new ToolMessage({
          tool_call_id: toolCall.id!,
          content: ERROR_MESSAGES.TOOL_NOT_FOUND(toolCall.name),
        })
      );
      continue;
    }

    try {
      let args = toolCall.args;
      if (state.fileStorage && Object.keys(state.fileStorage).length > 0) {
        const fileId = Object.keys(state.fileStorage)[0];
        const fileBase64 = state.fileStorage[fileId];

        if (!args.fileBase64 && fileBase64) {
          console.log("callTools: Injecting fileBase64 from storage");
          args = { ...args, fileBase64 };
        }
      }

      console.log("callTools: Calling tool with args:", Object.keys(args));
      const result = await (tool as any).invoke(args);
      console.log("callTools: Tool result received");

      toolMessages.push(
        new ToolMessage({
          tool_call_id: toolCall.id!,
          content: result,
        })
      );
    } catch (error) {
      console.error("callTools: Error executing tool:", error);
      toolMessages.push(
        new ToolMessage({
          tool_call_id: toolCall.id!,
          content: ERROR_MESSAGES.TOOL_EXECUTION_ERROR(error),
        })
      );
    }
  }

  return { messages: toolMessages };
}

const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", callTools)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const graph = workflow.compile();

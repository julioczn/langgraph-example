import { graph } from "@/lib/graph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const fileStorage = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, file } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const langchainMessages = messages.map((msg: any) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    let fileId: string | undefined;
    if (file) {
      console.log(
        "File received:",
        file.name,
        "size:",
        file.base64.length,
        "chars"
      );

      fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      fileStorage.set(fileId, file.base64);

      const lastMessage = langchainMessages[langchainMessages.length - 1];
      if (lastMessage instanceof HumanMessage) {
        lastMessage.content = `${
          lastMessage.content
        }\n\n📎 Arquivo PDF anexado: ${file.name} (${Math.round(
          file.base64.length / 1024
        )} KB)`;
      }
      console.log("File stored with ID:", fileId);
    }

    console.log("Invoking graph with messages:", langchainMessages.length);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Graph execution timeout")), 120000);
    });

    const result = (await Promise.race([
      graph.invoke({
        messages: langchainMessages,
        fileStorage: fileId ? { [fileId]: fileStorage.get(fileId)! } : {},
      }),
      timeoutPromise,
    ])) as any;

    if (fileId) {
      fileStorage.delete(fileId);
    }

    console.log(
      "Graph execution completed, messages:",
      result.messages?.length
    );

    const lastMessage = result.messages[result.messages.length - 1];

    console.log("Last message type:", lastMessage.constructor.name);

    return NextResponse.json({
      message: lastMessage.content,
      toolCalls: (lastMessage as any).tool_calls || [],
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

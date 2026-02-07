import { createAgent, providerStrategy } from "langchain";
import { z } from "zod/v4";
import { getEmitter } from "../emitter";
import {
  MIND_MAP_STATUS,
  MIND_MAP_STATUS_QUEUE_NAME,
} from "../../types/mindmap-status.types";
import { MindMapService } from "../../services/mindmap.service";
import { mindMapQueue } from "../queues/mindmap-queue";

const MindMap = z.object({
  chartCode: z
    .string()
    .describe("The chart code for the mind map in Mermaid JS syntax"),
});

export type MindMapType = z.infer<typeof MindMap>;

export type MindMapCreationQueueType = {
  conversationId: string;
  documentText: string;
};

const agent = createAgent({
  model: "gpt-4o-mini",
  tools: [],
  responseFormat: providerStrategy(MindMap),
});

mindMapQueue.process(2, async (job: { data: MindMapCreationQueueType }) => {
  const { documentText, conversationId } = job.data;

  const io = getEmitter();

  try {
    const result = await agent.invoke({
      messages: [
        {
          role: "system",
          content: `
          You are an expert AI specialized in creating clean, visually appealing, and well-organized mind maps from document text using Mermaid JS syntax.
Your goal is to produce a single, readable, aesthetically pleasing mind map that effectively summarizes the key structure and concepts of the provided document, without overwhelming the viewer.
Output Requirements:

Return ONLY the complete Mermaid JS code block.
No explanations, no additional text, no markdown outside the code block.
Use the mindmap diagram type with proper indentation (2 or 4 spaces per level).

Design and Structure Guidelines for Beautiful, Clear Mind Maps:

Central node: Use a concise, bold title that captures the main topic of the document (use double parentheses for rounded shape: ((Main Topic))).
Limit total nodes to 15–25 maximum. Ruthlessly prioritize only the most essential concepts.
Maximum depth: 3–4 levels (root → main branches → sub-branches → key details if absolutely necessary).
Use logical grouping: Group related ideas under the same parent branch for better visual flow.
Node labels: Keep them short (ideally 3–6 words), clear, and meaningful. Avoid redundancy.
NEVER use numbers in parentheses like (1), (2), Section 3, etc. — this breaks many Mermaid renderers.
Avoid long or wrapping text in nodes — shorten where possible.
Favor radial balance: Aim for 4–7 main branches from the root to prevent crowding on one side.
Do not include minor examples, specific names (e.g., authors, years), or tangential details unless they are core to the document's message.
Prioritize hierarchy and relationships over completeness — the mind map should guide understanding at a glance.
          `,
        },
        {
          role: "human",
          content: `The documents whole text is given here: ${documentText}`,
        },
      ],
    });

    const mindMap = result.structuredResponse;

    await MindMapService.createMindMap(mindMap, conversationId);

    io.to(conversationId).emit(MIND_MAP_STATUS_QUEUE_NAME, {
      status: "finished" as MIND_MAP_STATUS,
    });
  } catch (err) {
    console.error("Error while creating mind map", err);
    io.to(conversationId).emit(MIND_MAP_STATUS_QUEUE_NAME, {
      status: "error" as MIND_MAP_STATUS,
    });
  }
});

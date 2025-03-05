import { QueuedGeneration } from "@giselle-sdk/data-type";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { GiselleEngine } from "../core";
import { createHandler } from "./create-handler";

export const createRouters = {
	createWorkspace: (giselleEngine: GiselleEngine) =>
		createHandler({
			handler: async () => {
				const workspace = await giselleEngine.createWorkspace();
				return NextResponse.json(workspace);
			},
		}),
	generateText: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ generation: QueuedGeneration }),
			handler: async ({ input }) => {
				const stream = await giselleEngine.generateText(input.generation);
				return stream.toDataStreamResponse();
			},
		}),
} as const;

export const routerPaths = Object.keys(createRouters) as RouterPaths[];

// Export the types at module level
export type RouterPaths = keyof typeof createRouters;
export type RouterHandlers = {
	[P in RouterPaths]: ReturnType<(typeof createRouters)[P]>;
};
export type RouterInput = {
	[P in RouterPaths]: Parameters<RouterHandlers[P]>[0]["input"];
};
export function isRouterPath(path: string): path is RouterPaths {
	return path in createRouters;
}

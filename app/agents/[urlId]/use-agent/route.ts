import type { AgentProcess } from "@/app/agents/models/agent-process";
import { getAgentProcess } from "@/app/agents/queries/get-agent-process";
import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { invokeTask } from "@/trigger/invoke";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { getBlueprint } from "../_helpers/get-blueprint";
import { inferProcesses } from "./infer-process";

export const POST = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const blueprint = await getBlueprint(params.urlId);
	const inferedProcesses = inferProcesses(blueprint);
	const insertedProcesses = await db
		.insert(schema.processes)
		.values(
			inferedProcesses.map((process) => ({
				...process,
				blueprintId: blueprint.id,
			})),
		)
		.returning({
			insertedId: schema.processes.id,
			nodeId: schema.processes.nodeId,
		});
	const dataEdges = blueprint.edges.filter(
		({ edgeType }) => edgeType === "data",
	);
	for (const dataEdge of dataEdges) {
		const inputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.inputPort.nodeId,
		);
		const outputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.outputPort.nodeId,
		);
		const [inputDataKnot, outputDataKnot] = await db
			.insert(schema.dataKnots)
			.values([
				{ processId: inputProcess?.insertedId, portId: dataEdge.inputPort.id },
				{ processId: outputProcess?.insertedId, portId: dataEdge.inputPort.id },
			])
			.returning({
				insertedId: schema.dataKnots.id,
			});
		await db.insert(schema.dataRoutes).values({
			originKnotId: outputDataKnot.insertedId,
			destinationKnotId: inputDataKnot.insertedId,
		});
	}

	const [insertedRun] = await db
		.insert(schema.runs)
		.values({
			blueprintId: blueprint.id,
			status: "creating",
		})
		.returning({ insertedId: schema.runs.id });
	await db.insert(schema.runProcesses).values(
		insertedProcesses.map<typeof schema.runProcesses.$inferInsert>(
			({ insertedId }) => ({
				runId: insertedRun.insertedId,
				processId: insertedId,
				status: "idle",
			}),
		),
	);
	const handle = await invokeTask.trigger({
		runId: insertedRun.insertedId,
		agentUrlId: params.urlId,
	});

	await db.insert(schema.runTriggerRelations).values({
		runId: insertedRun.insertedId,
		triggerId: handle.id,
	});

	const agentProcess: AgentProcess = {
		agent: {
			id: blueprint.agent.id,
			blueprint: {
				id: blueprint.id,
			},
		},
		run: {
			id: insertedRun.insertedId,
			status: "creating",
			processes: insertedProcesses.map(({ insertedId, nodeId }) => {
				const node = blueprint.nodes.find(({ id }) => id === nodeId);
				invariant(node != null, `Node not found: ${nodeId}`);
				return {
					id: insertedId,
					node: {
						id: nodeId,
						type: node.type,
					},
					status: "idle",
					run: {
						id: insertedRun.insertedId,
					},
				};
			}),
		},
	};
	return NextResponse.json(agentProcess);
};

export const GET = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const agentProcess = await getAgentProcess(params.urlId);

	return NextResponse.json(agentProcess);
};

import { db, requestStacks, requestSteps, requests } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq } from "drizzle-orm";
import {
	type RequestId,
	type RequestStatus,
	requestStepStatus,
} from "../types";
import { getNextNode } from "./get-next-node";
import { revalidateGetRequest } from "./get-request";

export const updateRequestStatus = async (
	requestId: RequestId,
	status: RequestStatus,
) => {
	await db
		.update(requests)
		.set({
			status,
		})
		.where(eq(requests.id, requestId));
	await revalidateGetRequest(requestId);
};

export const pushNextNodeToRequestStack = async (
	requestStackDbId: number,
	currentNodeDbId: number,
	requestId: RequestId,
) => {
	const nextNode = await getNextNode(currentNodeDbId);
	if (nextNode == null) {
		return;
	}
	await db.insert(requestSteps).values({
		id: `rqst.stp_${createId()}`,
		requestStackDbId,
		nodeDbId: nextNode.dbId,
	});
	await revalidateGetRequest(requestId);
};

export async function* runStackGenerator(requestStackDbId: number) {
	const [requestStack] = await db
		.select({
			startNodeDbId: requestStacks.startNodeDbId,
			requestId: requests.id,
		})
		.from(requestStacks)
		.innerJoin(requests, eq(requests.dbId, requestStacks.requestDbId))
		.where(eq(requestStacks.dbId, requestStackDbId));

	await pushNextNodeToRequestStack(
		requestStackDbId,
		requestStack.startNodeDbId,
		requestStack.requestId,
	);

	while (true) {
		const [step] = await getFirstQueuedStep(requestStackDbId);
		if (step == null) break;
		yield step;
	}
}

async function getFirstQueuedStep(requestStackDbId: number) {
	return await db
		.select({ dbId: requestSteps.dbId })
		.from(requestSteps)
		.where(
			and(
				eq(requestSteps.requestStackDbId, requestStackDbId),
				eq(requestSteps.status, requestStepStatus.inProgress),
			),
		)
		.orderBy(asc(requestSteps.dbId))
		.limit(1);
}

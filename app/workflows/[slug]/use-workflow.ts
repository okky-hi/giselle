import type { ResponseJson } from "@/app/api/workflows/[slug]/route";
import { fetcher, typedFetcher } from "@/lib/fetcher";
import { useCallback, useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import useSWR from "swr";
import { NodeTypes } from "./node";
import type { Run } from "./run";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};

export const useWorkflow = (slug: string) => {
	const { data, error, isLoading, mutate } = useSWR<ResponseJson>(
		`/api/workflows/${slug}`,
		typedFetcher,
	);
	const editorState = useMemo<EditorState>(() => {
		if (isLoading || data == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = data.workflow.nodes.map((node) => ({
			id: `${node.id}`,
			type: NodeTypes.V2,
			position: node.position,
			data: {
				structureKey: node.type,
			},
		}));
		const edges = data.workflow.edges.map(
			({ id, sourceNodeId, sourceHandleId, targetNodeId, targetHandleId }) => ({
				id: `${id}`,
				source: `${sourceNodeId}`,
				sourceHandle: sourceHandleId == null ? null : `${sourceHandleId}`,
				target: `${targetNodeId}`,
				targetHandle: targetHandleId == null ? null : `${targetHandleId}`,
			}),
		);
		return { nodes, edges };
	}, [isLoading, data]);

	const run = useCallback(() => {}, []);

	return { editorState, workflow: data?.workflow };
};

"use client";

import { type FC, useCallback, useRef, useState } from "react";
import ReactFlow, {
	Controls,
	Background,
	BackgroundVariant,
	type ReactFlowInstance,
	ReactFlowProvider,
	Panel,
} from "reactflow";

import "reactflow/dist/style.css";
import type { NodeType } from "@/app/node-defs";
import { useNodeDefs } from "@/app/node-defs/use-node-defs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayIcon } from "@radix-ui/react-icons";
import { ALargeSmallIcon, GripIcon, PlusIcon } from "lucide-react";
import { EditorDropdownMenu } from "./editor-dropdown-menu";
import { useNodeTypes } from "./node";
import type { Context } from "./strcture";
import { useAgent } from "./use-agent";
import { AgentUrlIdProvider } from "./use-agent-url-id";
import { useContextMenu } from "./use-context-menu";
import { useEditor } from "./use-editor";

const contexts: Context[] = [
	{
		key: "inputResources",
		name: "Input Resources",
		type: "string",
		array: true,
	},
	{
		key: "documents",
		name: "Documents",
		type: "string",
		array: true,
	},
	{
		key: "theme",
		name: "Theme",
		type: "string",
	},
	{
		key: "format",
		name: "Format",
		type: "string",
	},
];

const WorkflowEditor: FC = () => {
	const { runAgent, runningAgent } = useAgent();
	const { editorState, addNode, deleteNodes, connectNodes, deleteEdges } =
		useEditor();
	const { nodeDefs } = useNodeDefs();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();

	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const handleNodeSelect = useCallback(
		(type: NodeType) => {
			hideContextMenu();

			if (reactFlowInstance == null) {
				return;
			}

			// reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
			// and you don't need to subtract the reactFlowBounds.left/top anymore
			// details: https://reactflow.dev/whats-new/2023-11-10
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: position.x,
				y: position.y,
			});
			addNode({
				nodeType: type,
				position: { x: flowPosition.x, y: flowPosition.y },
			});
		},
		[hideContextMenu, position, reactFlowInstance, addNode],
	);

	return (
		<div className="w-screen h-screen pl-4 pb-4 pt-2 pr-2 bg-background flex flex-col text-foreground">
			<div className="mb-2 text-primary">Agent Flow Editor</div>
			<div className="w-full h-full flex bg-background gap-4">
				<div className="w-[200px] p-0.5">
					<div>
						<div className="flex items-center justify-between text-secondary-foreground px-1 py-1 text-sm">
							<p>Files</p>
						</div>

						<ul className="flex flex-col gap-1 mt-1">
							<li className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground">
								<span>Workflow.wrk</span>
							</li>
							<li className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground">
								<span>Draft.agt</span>
							</li>
						</ul>
					</div>
					<div>
						<div className="flex items-center justify-between text-secondary-foreground px-1 py-1 text-sm">
							<p>Context</p>
							<Button size="icon">
								<PlusIcon className="w-4 h-4" />
							</Button>
						</div>
						<ul className="flex flex-col gap-1 mt-1">
							{contexts.map(({ key, name, array }) => (
								<li
									key={key}
									className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground"
								>
									{array ? (
										<GripIcon className="w-4 h-4" />
									) : (
										<ALargeSmallIcon className="w-4 h-4" />
									)}

									<span>{name}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="flex-1 flex h-full overflow-hidden border border-border">
					<Tabs defaultValue="Workflow.wks" className="flex-1 flex flex-col">
						<TabsList>
							<TabsTrigger value="Workflow.wks">Workflow.wks</TabsTrigger>
							<TabsTrigger value="Draft.agt">Draft.agt</TabsTrigger>
						</TabsList>
						<TabsContent
							value="Workflow.wks"
							className="w-full h-full flex flex-col"
						>
							<div className="bg-secondary py-1 px-1">
								<Button
									variant={"ghost"}
									size={"xs"}
									className="text-muted-foreground"
									onClick={() => runAgent()}
								>
									<PlayIcon className="mr-1" />
									Run Workflow
								</Button>
							</div>
							<div className="flex-1" ref={containerRef}>
								<ReactFlow
									onContextMenu={handleContextMenu}
									onPaneClick={hideContextMenu}
									nodes={editorState.nodes}
									onNodesDelete={(nodes) => {
										deleteNodes(nodes.map((node) => Number.parseInt(node.id)));
									}}
									onConnect={({
										source,
										sourceHandle,
										target,
										targetHandle,
									}) => {
										if (
											source == null ||
											sourceHandle == null ||
											target == null ||
											targetHandle == null
										) {
											return;
										}
										connectNodes({
											originPort: {
												id: Number.parseInt(sourceHandle),
												nodeId: Number.parseInt(source),
											},
											destinationPort: {
												id: Number.parseInt(targetHandle),
												nodeId: Number.parseInt(target),
											},
										});
									}}
									onEdgesDelete={(edges) => {
										deleteEdges(edges.map((edge) => Number.parseInt(edge.id)));
									}}
									edges={editorState.edges}
									nodeTypes={nodeTypes}
									onInit={setReactFlowInstance}
								>
									<Background
										variant={BackgroundVariant.Dots}
										className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/20"
									/>
									<Controls />
									{runningAgent && (
										<Panel position="top-right">
											hello
											{/* <WorkflowRunner
												status={runningAgent.latestRun.status}
												steps={runningAgent.steps}
											/> */}
										</Panel>
									)}

									{nodeDefs != null && isVisible && (
										<div
											className="z-10 absolute"
											style={{
												left:
													position.x - (containerRef?.current?.offsetLeft ?? 0),
												top:
													position.y - (containerRef?.current?.offsetTop ?? 0),
											}}
										>
											<EditorDropdownMenu
												nodeDefs={nodeDefs}
												onSelect={handleNodeSelect}
											/>
										</div>
									)}
								</ReactFlow>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default function Page({ params }: { params: { urlId: string } }) {
	return (
		<ReactFlowProvider>
			<AgentUrlIdProvider urlId={params.urlId}>
				<WorkflowEditor />
			</AgentUrlIdProvider>
		</ReactFlowProvider>
	);
}

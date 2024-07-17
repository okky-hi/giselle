import {
	type Node,
	useAddNodePortAction,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { Feature, findNodeClass, useNodeClasses } from "@/app/node-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { AlignLeftIcon, PlusIcon } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import { match } from "ts-pattern";

type NodeModifyPanelProps = {
	selectedNodes: Node[];
};
export const NodeModifyPanel: FC<NodeModifyPanelProps> = ({
	selectedNodes,
}) => {
	return (
		<div className="bg-background/50 border border-border w-[300px] text-sm">
			<div className="px-4 py-2">
				<p className="font-bold">Properties</p>
			</div>

			<div className="px-4 py-2 flex flex-col gap-2">
				{selectedNodes.length > 1 ? (
					<p>{selectedNodes.length} nodes selected</p>
				) : (
					<NodeModifyPanelInner node={selectedNodes[0]} />
				)}
			</div>
		</div>
	);
};

type NodeModifyPanelInnerProps = {
	node: Node;
};
const NodeModifyPanelInner: FC<NodeModifyPanelInnerProps> = ({ node }) => {
	const nodeClasses = useNodeClasses();
	const nodeClass = useMemo(
		() => findNodeClass(nodeClasses, node.className),
		[nodeClasses, node.className],
	);
	return (
		<div className="flex flex-col gap-2">
			<div>
				{nodeClass?.features?.map((feature) =>
					match(feature)
						.with({ name: "dynamicOutputPort" }, () => (
							<DynamicOutputPort node={node} key={feature.name} />
						))
						.exhaustive(),
				)}
			</div>
		</div>
	);
};

type DynamicOutputPortProps = {
	node: Node;
};
const DynamicOutputPort: FC<DynamicOutputPortProps> = ({ node }) => {
	const blueprintId = useBlueprintId();
	const { addNodePort } = useAddNodePortAction();
	const heading = node.className === "onRequest" ? "Parameters" : "Output Port";
	const [disclosure, setDisclosure] = useState(false);
	const handleOpenChange = useCallback(
		(open: boolean) => {
			setDisclosure(open);
			if (open) {
				addNodePort({
					port: {
						nodeId: node.id,
						direction: "output",
						name: "Parameter",
					},
				});
			}
		},
		[addNodePort, node],
	);
	return (
		<div>
			<div className="flex justify-between mb-2">
				<h3 className="text-sm font-bold">{heading}</h3>
				<div>
					<Popover open={disclosure} onOpenChange={handleOpenChange}>
						<PopoverTrigger asChild>
							<Button size="icon" variant="ghost">
								<PlusIcon className="w-4 h-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<Input placeholder="Parameter" />
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				{node.outputPorts
					.filter(({ type }) => type === "data")
					.map((port) => (
						<div key={port.id} className="flex gap-1 items-center">
							<AlignLeftIcon className="w-4 h-4" />
							<span>{port.name}</span>
						</div>
					))}
			</div>
		</div>
	);
};

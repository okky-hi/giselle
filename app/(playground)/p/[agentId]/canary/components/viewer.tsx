"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { type DetailedHTMLProps, useMemo } from "react";
import { SpinnerIcon } from "../../beta-proto/components/icons/spinner";
import { WilliIcon } from "../../beta-proto/components/icons/willi";
import { useExecution } from "../contexts/execution";
import { useGraph } from "../contexts/graph";
import type { Execution, Node, StepExecution } from "../types";
import bg from "./bg.png";
import { ContentTypeIcon } from "./content-type-icon";
import { Header } from "./header";
import { EmptyState } from "./ui/empty-state";

interface StepExecutionButtonProps
	extends DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	stepExecution: StepExecution;
	node: Node;
}
function StepExecutionButton({
	stepExecution,
	node,
	...props
}: StepExecutionButtonProps) {
	return (
		<button
			type="button"
			className="flex items-center gap-[8px] rounded-[4px] px-[8px] py-[4px] data-[state=active]:bg-black-80"
			{...props}
		>
			{stepExecution.status === "pending" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)}
			{stepExecution.status === "running" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
			)}
			{stepExecution.status === "completed" && (
				<ContentTypeIcon
					contentType={node.content.type}
					className="w-[18px] h-[18px] fill-current text-white"
				/>
			)}

			<div className="flex flex-col items-start">
				<p className="truncate text-[14px] font-rosart">{node.content.type}</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{node.name} / {stepExecution.status}
				</p>
			</div>
		</button>
	);
}

function ExecutionViewer({
	execution: tmpExecution,
}: { execution: Execution }) {
	const { graph } = useGraph();
	const execution = useMemo(
		() => ({
			...tmpExecution,
			jobExecutions: tmpExecution.jobExecutions.map((jobExecution) => ({
				...jobExecution,
				stepExecutions: jobExecution.stepExecutions
					.map((stepExecution) => {
						const node = graph.nodes.find(
							(node) => node.id === stepExecution.nodeId,
						);
						if (node === undefined) {
							return null;
						}
						return {
							...stepExecution,
							node,
						};
					})
					.filter((stepExecution) => stepExecution !== null),
			})),
		}),
		[tmpExecution, graph.nodes],
	);

	return (
		<Tabs.Root className="flex-1 flex w-full gap-[16px] pt-[16px] overflow-hidden h-full mx-[20px]">
			<div className="w-[200px]">
				<Tabs.List className="flex flex-col gap-[8px]">
					{execution.jobExecutions.map((jobExecution, index) => (
						<div key={jobExecution.id}>
							<p className="text-[12px] text-black-30 mb-[4px]">
								Step {index + 1}
							</p>
							<div className="flex flex-col gap-[4px]">
								{jobExecution.stepExecutions.map((stepExecution) => (
									<Tabs.Trigger
										key={stepExecution.id}
										value={stepExecution.id}
										asChild
									>
										<StepExecutionButton
											key={stepExecution.id}
											stepExecution={stepExecution}
											node={stepExecution.node}
										/>
									</Tabs.Trigger>
								))}
							</div>
						</div>
					))}
				</Tabs.List>
			</div>
			<div className="overflow-y-scroll flex-1">
				{/* {state.flow.jobs.flatMap((job) =>
					job.steps
						.filter(
							(step) =>
								step.status === stepStatuses.streaming ||
								step.status === stepStatuses.completed,
						)
						.map((step) => (
							<Tabs.Content key={step.id} value={step.id}>
								{step.output.object === "artifact.text" ? (
									<ArtifactRender
										title={step.output.title}
										content={step.output.content}
									/>
								) : (
									<div className="px-[16px] py-[16px] font-rosart text-[18px] text-black-30">
										<table className="w-full divide-y divide-black-40 font-avenir border-separate border-spacing-[16px] text-left text-black-70 ">
											<colgroup>
												<col width="0%" />
												<col width="100%" />
												<col width="0%" />
											</colgroup>
											<thead className="font-[500] text-[12px]">
												<tr>
													<th>Status</th>
													<th>Content</th>
													<th>Relevance</th>
												</tr>
											</thead>
											<tbody className="">
												{step.output.scrapingTasks.map((scrapingTask) => (
													<tr key={scrapingTask.id}>
														<td>
															{scrapingTask.state === "completed" ? (
																<CircleCheckIcon className="w-[20px] h-[20px] fill-green" />
															) : scrapingTask.state === "failed" ? (
																<CircleXIcon className="w-[20px] h-[20px] fill-[hsla(11,100%,50%,1)]" />
															) : (
																""
															)}
														</td>
														<td className="text-black-30 max-w-[1px]">
															<p className="font-rosart text-[18px] underline truncate">
																{scrapingTask.title}
															</p>
															<p className="text-[12px] truncate">
																{scrapingTask.url}
															</p>
														</td>
														<td className="text-green font-[900]">
															{Math.min(
																0.99,
																Number.parseFloat(
																	scrapingTask.relevance.toFixed(2),
																),
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</Tabs.Content>
						)),
				)} */}
			</div>
		</Tabs.Root>
	);
}

export function Viewer() {
	const { execution } = useExecution();
	return (
		<div
			className="w-full h-screen bg-black-100 flex flex-col"
			style={{
				backgroundImage: `url(${bg.src})`,
				backgroundPositionX: "center",
				backgroundPositionY: "center",
				backgroundSize: "cover",
			}}
		>
			<Header />
			<div className="flex-1 w-full flex items-center justify-center">
				{execution === null ? (
					<EmptyState
						icon={
							<WilliIcon className="fill-current w-[32px] h-[32px] text-black-30" />
						}
						title="This has not yet been executed"
						description="You have not yet
					executed the node. Let's execute entire thing and create the final
					output."
					/>
				) : (
					<ExecutionViewer execution={execution} />
				)}
			</div>
		</div>
	);
}

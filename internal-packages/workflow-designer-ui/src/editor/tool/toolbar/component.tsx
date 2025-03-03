"use client";

import { FileCategory, LLMProvider } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { MousePointer2Icon } from "lucide-react";
import { Popover, ToggleGroup } from "radix-ui";
import {
	AnthropicIcon,
	DocumentIcon,
	GoogleWhiteIcon,
	OpenaiIcon,
	PdfFileIcon,
	PromptIcon,
	StackBlicksIcon,
	TextFileIcon,
} from "../../../icons";
import { Tooltip } from "../../../ui/tooltip";
import { isToolAction } from "../types";
import {
	addFileNodeTool,
	addTextGenerationNodeTool,
	addTextNodeTool,
	moveTool,
	useToolbar,
} from "./state";

function TooltipAndHotkey({ text, hotkey }: { text: string; hotkey?: string }) {
	return (
		<div className="flex justify-between items-center gap-[8px]">
			<p>{text}</p>
			{hotkey && <p className="uppercase text-black-70">{hotkey}</p>}
		</div>
	);
}

export function Toolbar() {
	const { setSelectedTool, selectedTool } = useToolbar();
	const { llmProviders } = useWorkflowDesigner();
	return (
		<div className="relative rounded-[8px] overflow-hidden bg-[hsla(255,_40%,_98%,_0.04)]">
			<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
			<div className="flex divide-x divide-[hsla(232,36%,72%,0.2)] items-center px-[8px] py-[8px]">
				<ToggleGroup.Root
					type="single"
					className={clsx(
						"flex items-center px-[16px] z-10 h-full gap-[12px] text-white-950",
						"**:data-tool:hover:bg-white-850/10 **:data-tool:p-[4px] **:data-tool:rounded-[4px]",
						"**:data-tool:data-[state=on]:bg-primary-900 **:data-tool:focus:outline-none",
						"**:data-icon:w-[24px] **:data-icon:h-[24px] **:data-icon:text-white-950 ",
					)}
					value={selectedTool?.action}
					onValueChange={(value) => {
						if (isToolAction(value)) {
							switch (value) {
								case "move":
									setSelectedTool(moveTool());
									break;
								case "addTextNode":
									setSelectedTool(addTextNodeTool());
									break;
								case "addFileNode":
									setSelectedTool(addFileNodeTool());
									break;
								case "addTextGenerationNode":
									setSelectedTool(addTextGenerationNodeTool());
									break;
							}
						}
					}}
				>
					<ToggleGroup.Item value="move" data-tool>
						<Tooltip text={<TooltipAndHotkey text="Move" hotkey="v" />}>
							<MousePointer2Icon data-icon />
						</Tooltip>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="addTextNode" data-tool>
						<Tooltip text={<TooltipAndHotkey text="Text" hotkey="t" />}>
							<PromptIcon data-icon />
						</Tooltip>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="addFileNode" data-tool>
						<DocumentIcon data-icon />
						{selectedTool?.action === "addFileNode" && (
							<Popover.Root open={true}>
								<Popover.Anchor />
								<Popover.Portal>
									<Popover.Content
										className={clsx(
											"relative w-[160px] rounded-[8px] px-[8px] py-[8px]",
											"bg-[hsla(255,_40%,_98%,_0.04)] text-white-900",
											"backdrop-blur-[4px]",
										)}
										sideOffset={42}
									>
										<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
										<div className="relative flex flex-col gap-[8px]">
											<ToggleGroup.Root
												type="single"
												className={clsx(
													"flex flex-col gap-[8px]",
													"**:data-tool:flex **:data-tool:rounded-[8px] **:data-tool:items-center **:data-tool:w-full",
													"**:data-tool:select-none **:data-tool:outline-none **:data-tool:px-[8px] **:data-tool:py-[4px] **:data-tool:gap-[8px] **:data-tool:hover:bg-white-900/10",
													"**:data-tool:data-[state=on]:bg-primary-900 **:data-tool:focus:outline-none",
												)}
												value={selectedTool.fileCategory}
												onValueChange={(fileCategory) => {
													setSelectedTool({
														...selectedTool,
														fileCategory: FileCategory.parse(fileCategory),
													});
												}}
											>
												<ToggleGroup.Item value="pdf" data-tool>
													<PdfFileIcon className="w-[20px] h-[20px]" />
													<p className="text-[14px]">PDF</p>
												</ToggleGroup.Item>
												<ToggleGroup.Item value="text" data-tool>
													<TextFileIcon className="w-[20px] h-[20px]" />
													<p className="text-[14px]">Text</p>
												</ToggleGroup.Item>
											</ToggleGroup.Root>
										</div>
									</Popover.Content>
								</Popover.Portal>
							</Popover.Root>
						)}
					</ToggleGroup.Item>
					<ToggleGroup.Item value="addTextGenerationNode" data-tool>
						<StackBlicksIcon data-icon />
						{selectedTool?.action === "addTextGenerationNode" && (
							<Popover.Root open={true}>
								<Popover.Anchor />
								<Popover.Portal>
									<Popover.Content
										className={clsx(
											"relative w-[260px] rounded-[8px] px-[8px] py-[8px]",
											"bg-[hsla(255,_40%,_98%,_0.04)] text-white-900",
											"backdrop-blur-[4px]",
										)}
										sideOffset={42}
									>
										<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
										<div className="relative flex flex-col gap-[8px]">
											<ToggleGroup.Root
												type="single"
												className={clsx(
													"flex flex-col gap-[8px]",
													"**:data-tool:flex **:data-tool:rounded-[8px] **:data-tool:items-center **:data-tool:w-full",
													"**:data-tool:select-none **:data-tool:outline-none **:data-tool:px-[8px] **:data-tool:py-[4px] **:data-tool:gap-[8px] **:data-tool:hover:bg-white-900/10",
													"**:data-tool:data-[state=on]:bg-primary-900 **:data-tool:focus:outline-none",
												)}
												value={selectedTool.provider}
												onValueChange={(provider) => {
													setSelectedTool({
														...selectedTool,
														provider: LLMProvider.parse(provider),
													});
												}}
											>
												{llmProviders.some(
													(llmProvider) => llmProvider === "openai",
												) && (
													<ToggleGroup.Item value="openai" data-tool>
														<OpenaiIcon className="w-[20px] h-[20px]" />
														<p className="text-[14px]">OpenAI</p>
													</ToggleGroup.Item>
												)}
												{llmProviders.some(
													(llmProvider) => llmProvider === "google",
												) && (
													<ToggleGroup.Item value="google" data-tool>
														<GoogleWhiteIcon className="w-[20px] h-[20px]" />
														<p className="text-[14px]">Google</p>
													</ToggleGroup.Item>
												)}
												{llmProviders.some(
													(llmProvider) => llmProvider === "anthropic",
												) && (
													<ToggleGroup.Item value="anthropic" data-tool>
														<AnthropicIcon className="w-[20px] h-[20px]" />
														<p className="text-[14px]">Anthropic</p>
													</ToggleGroup.Item>
												)}
											</ToggleGroup.Root>
										</div>
									</Popover.Content>
								</Popover.Portal>
							</Popover.Root>
						)}
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
		</div>
	);
}

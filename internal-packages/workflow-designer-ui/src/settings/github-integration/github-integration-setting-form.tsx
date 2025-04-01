import type { WorkspaceGitHubNextIntegrationAction } from "@giselle-sdk/data-type";
import {
	WorkspaceGitHubIntegrationPayloadField,
	WorkspaceGitHubIntegrationTrigger,
} from "@giselle-sdk/data-type";
import type { GitHubIntegrationRepository } from "@giselle-sdk/integration";
import { useIntegration } from "@giselle-sdk/integration/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useEffect, useState } from "react";
import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui";
import { PayloadMapForm } from "./payload-map-form";
import { useGitHubIntegrationSetting } from "./use-github-integration-setting";

const NEXT_ACTION_DISPLAY_NAMES: Record<
	WorkspaceGitHubNextIntegrationAction,
	string
> = {
	"github.issue_comment.create": "Create Issue Comment",
	"github.pull_request_comment.create": "Create Pull Request Comment",
} as const;

const TRIGGER_TO_ACTIONS: Record<
	WorkspaceGitHubIntegrationTrigger,
	WorkspaceGitHubNextIntegrationAction[]
> = {
	"github.issues.opened": ["github.issue_comment.create"],
	"github.issue_comment.created": ["github.issue_comment.create"],
	"github.pull_request_comment.created": ["github.pull_request_comment.create"],
} as const;

const TRIGGERS_REQUIRING_CALLSIGN = [
	"github.issue_comment.created",
	"github.pull_request_comment.created",
] as const;

type TriggerRequiringCallsign = (typeof TRIGGERS_REQUIRING_CALLSIGN)[number];

const requiresCallsign = (
	trigger: WorkspaceGitHubIntegrationTrigger,
): boolean => {
	return TRIGGERS_REQUIRING_CALLSIGN.includes(
		trigger as TriggerRequiringCallsign,
	);
};

export function GitHubIntegrationSettingForm() {
	const { github } = useIntegration();

	switch (github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return "unauthorized";
		case "not-installed":
			return "not-installed";
		case "invalid-credential":
			return "invalid-credential";
		case "installed":
			return <Installed repositories={github.repositories} />;
		default: {
			const _exhaustiveCheck: never = github;
			throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
		}
	}
}

function Installed({
	repositories,
}: { repositories: GitHubIntegrationRepository[] }) {
	const { data: workspace } = useWorkflowDesigner();
	const { isLoading, data, handleSubmit } = useGitHubIntegrationSetting();
	const [selectedTrigger, setSelectedTrigger] = useState<
		WorkspaceGitHubIntegrationTrigger | undefined
	>(data?.event);
	const [callsign, setCallsign] = useState(data?.callsign || "");
	const [selectedNextAction, setSelectedNextAction] = useState<
		WorkspaceGitHubNextIntegrationAction | undefined
	>(data?.nextAction);

	useEffect(() => {
		if (data) {
			setSelectedTrigger(data.event);
			setCallsign(data.callsign || "");
			setSelectedNextAction(data.nextAction);
		}
	}, [data]);

	if (isLoading) {
		return null;
	}

	const getAvailablePayloadFields = (
		trigger: WorkspaceGitHubIntegrationTrigger,
	) => {
		const fields = Object.values(WorkspaceGitHubIntegrationPayloadField.Enum);
		const triggerParts = trigger.split(".");
		const triggerPrefix = `${triggerParts[0]}.${triggerParts[1]}`;
		return fields.filter((field) => field.startsWith(triggerPrefix));
	};

	const getAvailableNextActions = (
		trigger: WorkspaceGitHubIntegrationTrigger,
	) => {
		return TRIGGER_TO_ACTIONS[trigger] ?? [];
	};

	const handleTriggerChange = (value: string) => {
		const newTrigger = WorkspaceGitHubIntegrationTrigger.parse(value);
		const currentTrigger = selectedTrigger;
		setSelectedTrigger(newTrigger);

		if (newTrigger !== currentTrigger) {
			if (!requiresCallsign(newTrigger)) {
				setCallsign("");
			}

			const availableActions = getAvailableNextActions(newTrigger);
			if (
				selectedNextAction &&
				!availableActions.includes(selectedNextAction)
			) {
				setSelectedNextAction(undefined);
			}
		}
	};

	const availablePayloadFields = selectedTrigger
		? getAvailablePayloadFields(selectedTrigger)
		: [];
	const availableNextActions = selectedTrigger
		? getAvailableNextActions(selectedTrigger)
		: [];

	return (
		<div className="flex flex-col gap-[16px]">
			<h2 className="text-[14px] font-accent font-[700] text-white-400">
				GitHub Integration
			</h2>
			<form className="w-full flex flex-col gap-[16px]" onSubmit={handleSubmit}>
				<div className="grid grid-cols-[140px_1fr] gap-x-[4px] gap-y-[16px]">
					<h3 className="relative font-accent text-white-400 text-[14px] flex items-center font-bold">
						Repository
					</h3>
					<div>
						<fieldset className="flex flex-col gap-[4px]">
							<Select value={data?.repositoryNodeId} name="repositoryNodeId">
								<SelectTrigger>
									<SelectValue placeholder="Select a repository" />
								</SelectTrigger>
								<SelectContent>
									{repositories.map((repo) => (
										<SelectItem key={repo.node_id} value={repo.node_id}>
											{repo.full_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</fieldset>
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						<div className="flex items-center">Trigger</div>
					</h3>
					<div className="flex flex-col gap-[16px]">
						<fieldset className="flex flex-col gap-[4px]">
							<Label>Event</Label>
							<Select
								name="event"
								defaultValue={data?.event}
								onValueChange={handleTriggerChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a trigger" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value={
											WorkspaceGitHubIntegrationTrigger.Enum[
												"github.issues.opened"
											]
										}
									>
										issues.opened
									</SelectItem>
									<SelectItem
										value={
											WorkspaceGitHubIntegrationTrigger.Enum[
												"github.issue_comment.created"
											]
										}
									>
										issue_comment.created
									</SelectItem>
									<SelectItem
										value={
											WorkspaceGitHubIntegrationTrigger.Enum[
												"github.pull_request_comment.created"
											]
										}
									>
										pull_request_comment.created
									</SelectItem>
								</SelectContent>
							</Select>
						</fieldset>
						{requiresCallsign(
							selectedTrigger as WorkspaceGitHubIntegrationTrigger,
						) && (
							<fieldset className="flex flex-col gap-[4px]">
								<Label>Callsign</Label>
								<input
									type="text"
									className="bg-black-750 h-[28px] border-[1px] border-white-950/10 flex items-center px-[12px] text-[12px] rounded-[8px] outline-none placeholder:text-white-400/70"
									value={callsign}
									onChange={(e) => setCallsign(e.target.value)}
								/>
							</fieldset>
						)}
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						Data mapping
					</h3>
					<div>
						<PayloadMapForm
							nodes={workspace.nodes}
							currentPayloadMaps={data?.payloadMaps}
							availablePayloadFields={availablePayloadFields}
						/>
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						Then
					</h3>
					<fieldset className="flex flex-col gap-[4px]">
						<Select
							name="nextAction"
							value={selectedNextAction}
							onValueChange={(value) =>
								setSelectedNextAction(
									value as WorkspaceGitHubNextIntegrationAction,
								)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select an action" />
							</SelectTrigger>
							<SelectContent>
								{availableNextActions.map((action) => (
									<SelectItem key={action} value={action}>
										{NEXT_ACTION_DISPLAY_NAMES[action]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</fieldset>
				</div>
				<div className="flex justify-end">
					<button
						type="submit"
						className="h-[28px] rounded-[8px] bg-white-800 text-[14px] cursor-pointer text-black-800 font-[700] px-[16px] font-accent"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	);
}

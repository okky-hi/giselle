"use client";

import {
	type Dispatch,
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { OperationProvider } from "../nodes";
import { RequestProvider, type RequestRunnerProvider } from "../requests";
import type { AgentId } from "../types";
import { setGraph } from "./actions/set-graph";
import { type PlaygroundAction, playgroundReducer } from "./reducer";
import type { PlaygroundGraph, PlaygroundState } from "./types";
import { useDebounce } from "./use-debounce";

type PlaygroundContext = {
	dispatch: Dispatch<PlaygroundAction>;
	state: PlaygroundState;
};

const PlaygroundContext = createContext<PlaygroundContext | undefined>(
	undefined,
);

export type PlaygroundProviderProps = {
	agentId: AgentId;
	graph: PlaygroundGraph;
	requestRunnerProvider: RequestRunnerProvider;
};
export const PlaygroundProvider: FC<
	PropsWithChildren<PlaygroundProviderProps>
> = (props) => {
	const [state, dispatch] = useReducer(playgroundReducer, {
		agentId: props.agentId,
		graph: props.graph,
	});
	const debounceSetGraph = useDebounce(
		async (agentId: AgentId, graph: PlaygroundGraph) => {
			await setGraph(agentId, graph);
		},
		2000,
	);

	const dispatchWithMiddleware = useCallback(
		(action: PlaygroundAction) => {
			dispatch(action);
			debounceSetGraph(props.agentId, playgroundReducer(state, action).graph);
		},
		[state, debounceSetGraph, props.agentId],
	);

	return (
		<PlaygroundContext.Provider
			value={{
				dispatch: dispatchWithMiddleware,
				state,
			}}
		>
			<OperationProvider
				addPort={(port) => {
					dispatchWithMiddleware({ type: "ADD_PORT", port });
				}}
				updatePort={(portId, updates) => {
					dispatchWithMiddleware({ type: "UPDATE_PORT", portId, updates });
				}}
				deletePort={(portId) => {
					dispatchWithMiddleware({ type: "REMOVE_PORT", portId });
				}}
				updateNode={(nodeId, updates) => {
					dispatchWithMiddleware({ type: "UPDATE_NODE", nodeId, updates });
				}}
			>
				<RequestProvider
					agentId={props.agentId}
					requestRunnerProvider={props.requestRunnerProvider}
				>
					{props.children}
				</RequestProvider>
			</OperationProvider>
		</PlaygroundContext.Provider>
	);
};

export const usePlayground = () => {
	const context = useContext(PlaygroundContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphProvider");
	}
	return context;
};

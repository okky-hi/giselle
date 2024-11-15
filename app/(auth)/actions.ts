"use server";

import { type OAuthProvider, getAuthCallbackUrl } from "@/app/(auth)/lib";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

async function authorizeOAuth(provider: OAuthProvider) {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: getAuthCallbackUrl(),
		},
	});
	logger.debug(`authorized with ${provider}`);

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}

	if (data.url) {
		redirect(data.url);
	}
}

export async function authorizeGitHub() {
	return authorizeOAuth("github");
}

export async function authorizeGoogle() {
	return authorizeOAuth("google");
}

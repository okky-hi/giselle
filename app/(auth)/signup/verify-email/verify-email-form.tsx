"use client";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { type FC, useActionState, useCallback, useRef } from "react";
import { ActionPrompt } from "../../components/action-prompt";
import { useSignupContext } from "../context";
import { verifyEmail } from "./verify-email";

export const VerifyEmailForm: FC = () => {
	const { state } = useSignupContext();
	const [authError, action, isPending] = useActionState(verifyEmail, null);
	const formRef = useRef<HTMLFormElement>(null);
	const handleComplete = useCallback(() => {
		formRef.current?.requestSubmit();
	}, []);
	return (
		<form className="flex justify-center" action={action} ref={formRef}>
			<div className="grid gap-4">
				<InputOTP
					maxLength={6}
					data-1p-ignore
					name="token"
					onComplete={handleComplete}
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
				<input type="hidden" name="verificationEmail" value={state.email} />

				<div className="flex justify-center">
					<ActionPrompt
						prompt="Didn’t receive a code?"
						action="Click to resend"
					/>
				</div>
				<Button className="w-full" type="submit" disabled={isPending}>
					Verify
				</Button>
			</div>
		</form>
	);
};

import clsx from "clsx/lite";
import type { SVGProps } from "react";

export function AnthropicIcon({
	className,
	...props
}: SVGProps<SVGSVGElement>) {
	return (
		<svg
			className={clsx("fill-current", className)}
			width="46"
			height="32"
			viewBox="0 0 46 32"
			role="graphics-symbol"
			{...props}
		>
			<path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
		</svg>
	);
}

import { type FC, type SVGProps } from "react";

export const AudioIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M12 3v18" />
		<path d="M8 8v8" />
		<path d="M16 8v8" />
		<path d="M4 12v1" />
		<path d="M20 12v1" />
	</svg>
); 
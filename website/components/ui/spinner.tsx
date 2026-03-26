import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type React from "react";

// Controls the visibility and layout of the spinner container
const spinnerVariants = cva("flex-col items-center justify-center", {
	variants: {
		show: {
			true: "flex",
			false: "hidden",
		},
	},
	defaultVariants: {
		show: true,
	},
});

// Controls the size of the loader icon
const loaderVariants = cva("animate-spin bg-white text-black", {
	variants: {
		size: {
			small: "size-6",
			medium: "size-8",
			large: "size-12",
		},
	},
	defaultVariants: {
		size: "medium",
	},
});

interface SpinnerContentProps
	extends VariantProps<typeof spinnerVariants>,
		VariantProps<typeof loaderVariants> {
	className?: string;
	children?: React.ReactNode;
}

export function Spinner({
	size,
	show,
	children,
	className,
}: SpinnerContentProps) {
	return (
		<div className={cn(spinnerVariants({ show }), className)}>
			<Loader2 className={loaderVariants({ size })} />
			{children}
		</div>
	);
}

import { m, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransitionVariant, getAccessibleVariant } from "../utils/motionTokens";
import ErrorBoundary from "./ErrorBoundary";

interface PageTransitionProps {
    children: ReactNode;
    className?: string; // Optional class overriding for specialized pages
}

/**
 * A production-ready wrapper that applies a consistent entrance/exit 
 * animation to all pages, respects OS accessibility preferences, 
 * and catches render errors gracefully.
 */
export default function PageTransition({ children, className = "w-full min-h-screen flex flex-col" }: PageTransitionProps) {
    const shouldReduceMotion = useReducedMotion();

    // Natively strip transform animations if the user prefers reduced motion
    const accessibleVariant = getAccessibleVariant(pageTransitionVariant, !!shouldReduceMotion);

    return (
        <ErrorBoundary>
            <m.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={accessibleVariant}
                className={className}
                layout // allows smooth transition of layout dimensions
            >
                {children}
            </m.div>
        </ErrorBoundary>
    );
}

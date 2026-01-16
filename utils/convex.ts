import { ConvexReactClient } from "convex/react";

// Uses Vite env var VITE_CONVEX_URL. Fall back to the URL you provided.
export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || 'https://blessed-salamander-357.convex.cloud');

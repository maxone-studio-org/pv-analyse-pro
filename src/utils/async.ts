/** Yields to the browser for one frame so UI (loading indicators etc.) can update. */
export const yieldToUI = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

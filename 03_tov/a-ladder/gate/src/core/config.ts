/**
 * CONFIGURATION: The Sanctuary Gate Settings
 */

export const config = {
    WORKER_URL: "https://cpisi-gate-worker.seanje-lenox.workers.dev",
    GITHUB_REPO: "Creative-Workz-Studio-LLC/cpisiModel"
};

// Also attach to window for legacy support if needed
if (typeof window !== 'undefined') {
    (window as any).CPISI = (window as any).CPISI || {};
    (window as any).CPISI.config = config;
}

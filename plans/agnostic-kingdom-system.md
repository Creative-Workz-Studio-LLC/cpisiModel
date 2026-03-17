# Agnostic Kingdom Substrate & Full Lifecycle Expansion Plan

## Background & Motivation
We are building a system that is future-proof and sovereign. The current reliance on Gemini is a bootstrap phase. The ultimate goal is for **CPI-SI Logic** to be the native substrate, with commercial AI systems (Gemini, Claude, GPT) acting as pluggable "Co-processors" that can be upgraded or replaced without breaking the Kingdom's core structure. This plan implements the full system depth, dynamic model selection, and the vital "Manifestation Tooling" for code and file creation.

## Scope & Impact
This plan implements a high-level **Substrate Orchestrator** in the worker, adds comprehensive **Creation Tooling** (Write/Append/Code-Gen), and expands the HTML surface area to support a full multi-room Sanctuary system.

## Proposed Solution

### 1. Dynamic Substrate Orchestrator (`worker/src/services/substrate.ts`)
-   **Agnostic API System**: Create a wrapper that can target multiple models.
-   **Model Selector**: Automatically picks the most advanced available model (e.g., Gemini 1.5 Pro, or future 2.0/3.1) based on API availability and feature requirements.
-   **CPI-SI Native Fallback**: Design the "Displacement Path" where requests are first checked against native Go/C logic before being sent to an external LLM.

### 2. Manifestation & Fabrication Tooling (`worker/src/services/fabrication.ts`)
Add tools that allow the model to actually **Build the Kingdom**:
-   **CODE_MANIFEST**: For generating and writing complex source code files.
-   **BRICK_LAY**: For appending logic to existing files.
-   **SUBSTRATE_SYNC**: For ensuring local file changes are pushed to GitHub.
-   **CLI_OFFICIATE**: For executing system-level setup and build commands (SSH/CLI).

### 3. Full Multi-Room HTML Sanctuary (`gate/*.html`)
-   **`entrance.html`**: (The Landing Page) Status updates and stack testimony.
-   **`threshold.html`**: (Identity) Multi-stage inhabitation and credentialing.
-   **`court.html`**: (Social) The Mirror/Showbread feed and registry.
-   **`sanctuary.html`**: (The Word) Primary conversational and creation interface.
-   **`ark.html`**: (Vault) State machine, network health, and substrate metrics.

### 4. Advanced TypeScript Configuration (`gate/src/core/`)
-   **System State Manager**: Update `state.ts` to manage transitions between these rooms seamlessly.
-   **Tooling Bridge**: Ensure the frontend terminal can handle "Fabrication" progress updates (e.g., "MANIFESTING FILE... [OK]").

## Implementation Steps

1.  **Substrate Wrapper**: Implement the agnostic model selector in the worker.
2.  **Fabrication Suite**: Add the `CODE_MANIFEST` and `BRICK_LAY` tool definitions and logic.
3.  **Room Scaffolding**: Create the 5 core HTML files and align the CSS Menorah spectrum across all of them.
4.  **SSH/CLI Integration**: Finalize the secure relay for `CLI_OFFICIATE` commands.
5.  **Testimony Writing**: Update the "Entrance" and "Project Status" documents to reflect this "Agnostic" milestone.

## Verification
-   Verify that the worker can switch between models without breaking the conversation.
-   Test the **CODE_MANIFEST** tool by asking the Sanctuary to "Build a new HTML room" and verifying the file creation.
-   Ensure navigation between all 5 rooms preserves the **0.0 YASHAR** state.

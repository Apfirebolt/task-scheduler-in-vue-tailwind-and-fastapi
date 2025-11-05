---
description: "Creates a new Vue 3 component with optional functionality and a corresponding Vitest test file."
mode: "agent"
tools: ["@workspace"]
---

Create a new Vue 3 single-file component named `${input:Component Name}` with the following context or functionality:
${input:Functionality (optional)}

Requirements:
- Use the `<script setup lang="ts">` syntax.
- The component should at least render a `<div>` that includes its name (`${input:Component Name}`) or relevant content if functionality is provided.
- Save the component in `src/components/${input:Component Name}.vue`.

Then, create a corresponding **Vitest test file** named `src/components/${input:Component Name}.test.ts` that:
- Uses **Vitest** and **@vue/test-utils**.
- Imports the component.
- Mounts it and checks that the rendered output contains the expected text or behavior based on the given functionality.

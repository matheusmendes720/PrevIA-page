// Instrumentation file to handle Bun compatibility
// This prevents Next.js from trying to use AsyncLocalStorage APIs that Bun doesn't support

export async function register() {
  // Check if we're running in Bun
  if (typeof process !== 'undefined' && (process.env.BUN_VERSION || process.env.BUN_INSTALL)) {
    // Disable tracing for Bun runtime
    // This prevents the api.createContextKey error
    if (typeof process.env !== 'undefined') {
      process.env.NEXT_DISABLE_INSTRUMENTATION = '1';
    }
  }
}


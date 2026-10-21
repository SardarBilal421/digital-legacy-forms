"use server";

/**
 * Fake submit endpoint shared by the RHF, TanStack, Formik and baseline
 * variants. It intentionally does NOT persist or log the payload — this is a
 * demo. It simply simulates ~1s of network latency and returns a success
 * result with a throwaway reference id.
 */

export interface SubmitResult {
  ok: true;
  reference: string;
  receivedAt: string;
}

export async function submitForm(_payload: Record<string, unknown>): Promise<SubmitResult> {
  void _payload; // not stored, not logged — demo only.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    ok: true,
    reference: `DL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    receivedAt: new Date().toISOString(),
  };
}

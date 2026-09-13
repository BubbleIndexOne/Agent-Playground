/**
 * @fileoverview Cloudflare Worker Edge Entrypoint
 *
 * Handles HTTP requests at the Cloudflare Workers / Pages edge runtime.
 * Serves exported static Next.js assets from the `out/` directory binding (`env.ASSETS`),
 * while rejecting unhandled backend API requests with a 404 Response.
 */

/**
 * Cloudflare Worker Environment Bindings.
 */
export interface Env {
  /** Static asset fetcher binding configured in wrangler.toml */
  ASSETS: { fetch: typeof fetch };
}

export default {
  /**
   * Edge request handler dispatched for incoming HTTP requests.
   *
   * @param request - The incoming standard Request object.
   * @param env - Worker environment bindings containing the ASSETS service.
   * @returns Promise resolving to the served Response or a 404 status.
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};


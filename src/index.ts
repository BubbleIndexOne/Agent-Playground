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

    const cookieHeader = request.headers.get("Cookie") || "";
    const hasAuthToken = /(?:^|;\s*)ap_access_token=([^;]+)/.test(cookieHeader);

    // If accessing root or /login while carrying an active auth cookie, route to /home
    if ((url.pathname === "/" || url.pathname === "/login") && hasAuthToken) {
      return Response.redirect(new URL("/home", request.url), 302);
    }

    // If accessing protected workspace routes without an auth cookie, route to /login
    const isProtectedRoute =
      url.pathname.startsWith("/home") ||
      url.pathname.startsWith("/playground") ||
      url.pathname.startsWith("/agents") ||
      url.pathname.startsWith("/tools") ||
      url.pathname.startsWith("/history");

    if (isProtectedRoute && !hasAuthToken) {
      return Response.redirect(new URL("/login", request.url), 302);
    }

    return env.ASSETS.fetch(request);
  },
};


import * as React from "react";

// @ts-expect-error - This is resolved at runtime by Vite alias
import * as RRD from "react-router-dom-original";

// @ts-expect-error - This is resolved at runtime by Vite alias
export * from "react-router-dom-original";

declare const __ROUTE_MESSAGING_ENABLED__: boolean;

let routesPosted = false;

let resolveRoutesReady: ((value: unknown) => void) | null = null;
const routesReadyPromise = new Promise((res) => {
  resolveRoutesReady = res;
});

const routesReadyOrTimeout = (ms = 1200) =>
  Promise.race([routesReadyPromise, new Promise((r) => setTimeout(r, ms))]);

function normalize(p: string) {
  return p.replace(/\/+/g, "/");
}

function join(base: string, child: string) {
  if (!child) return base || "";
  if (child.startsWith("/")) return child;
  return normalize(`${base.replace(/\/$/, "")}/${child}`);
}

function flattenRoutes(node: React.ReactNode, base = "", acc = new Set<string>()): Set<string> {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const isRoute =
      child.type === RRD.Route ||
      (typeof child.type === "function" && child.type.name === "Route");
    if (isRoute) {
      const props = child.props as Record<string, unknown>;
      const path = props.path as string | undefined;
      const index = props.index as boolean | undefined;
      const children = props.children as React.ReactNode;
      const cur = index ? (base || "/") : path ? join(base, path) : base;
      if (index || path) acc.add(cur || "/");
      if (children) flattenRoutes(children, cur, acc);
    } else {
      const kids = (child.props as Record<string, unknown>)?.children as React.ReactNode | undefined;
      if (kids) flattenRoutes(kids, base, acc);
    }
  });
  return acc;
}

function postAllRoutesOnce(children: React.ReactNode) {
  if (routesPosted) return;
  try {
    const list = Array.from(flattenRoutes(children)).sort();

    if (!__ROUTE_MESSAGING_ENABLED__) return;

    if (window.top && window.top !== window) {
      const routesForMessage = list.map(route => ({ path: route }));
      window.top.postMessage({ type: "ROUTES_INFO", routes: routesForMessage, timestamp: Date.now() }, window.location.origin);
    }
  } finally {
    routesPosted = true;
    resolveRoutesReady?.(null);
    resolveRoutesReady = null;
  }
}

export function Routes(props: { children?: React.ReactNode }) {
  React.useEffect(() => { postAllRoutesOnce(props.children); }, []);
  return React.createElement(RRD.Routes, { ...props });
}

let lastEmittedPath = "";

function emitRouteChange(location: { pathname: string; search: string; hash: string }) {
  const path = `${location.pathname}${location.search}${location.hash}`;
  if (path === lastEmittedPath) return;
  lastEmittedPath = path;

  if (!__ROUTE_MESSAGING_ENABLED__) return;

  if (window.top && window.top !== window) {
    window.top.postMessage({
      type: "ROUTE_CHANGE",
      path: location.pathname,
      hash: location.hash,
      search: location.search,
      fullPath: location.pathname + location.search + location.hash,
      fullUrl: window.location.href,
      timestamp: Date.now(),
    }, window.location.origin);
  }
}

function RouterBridge() {
  const location = RRD.useLocation();
  const navigate = RRD.useNavigate();

  React.useEffect(() => {
    (async () => {
      await routesReadyOrTimeout();
      emitRouteChange(location);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.search, location.hash]);

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (!data || !__ROUTE_MESSAGING_ENABLED__) return;

      try {
        if (data.type === "ROUTE_CONTROL") {
          const { action, path, replace = false } = data;
          switch (action) {
            case "navigate":
              if (path) navigate(path, { replace });
              break;
            case "back":
              navigate(-1);
              break;
            case "forward":
              navigate(1);
              break;
            case "replace":
              if (path) navigate(path, { replace: true });
              break;
          }
        } else if (data.type === "RELOAD") {
          window.location.reload();
        }
      } catch (error) {
        console.error("Route control error:", error);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  return null;
}

function withBridge(children: React.ReactNode) {
  return (
    <>
      {children}
      <RouterBridge />
    </>
  );
}

export function HashRouter(props: { children?: React.ReactNode }) {
  return <RRD.HashRouter {...props}>{withBridge(props.children)}</RRD.HashRouter>;
}

export function BrowserRouter(props: { children?: React.ReactNode }) {
  return <RRD.BrowserRouter {...props}>{withBridge(props.children)}</RRD.BrowserRouter>;
}

export function MemoryRouter(props: { children?: React.ReactNode }) {
  return <RRD.MemoryRouter {...props}>{withBridge(props.children)}</RRD.MemoryRouter>;
}

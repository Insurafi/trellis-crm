import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options?: {
    headers?: Record<string, string>;
    skipErrorCheck?: boolean;
  }
): Promise<any> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...(options?.headers || {})
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // For DELETE requests that return 204 No Content
    if (res.status === 204) {
      return { status: 204, message: "No Content", success: true };
    }
    
    // Only throw error if not explicitly skipped
    if (!options?.skipErrorCheck) {
      await throwIfResNotOk(res);
    } else if (!res.ok) {
      // Return the error information but don't throw
      return { 
        status: res.status, 
        statusText: res.statusText,
        error: true,
        message: await res.text().catch(() => res.statusText) 
      };
    }
    
    // Try to parse as JSON, but handle text responses too
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      const text = await res.text();
      return { status: res.status, text, success: true };
    }
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
}) => QueryFunction<T> =
  (options = {}) =>
  async ({ queryKey }) => {
    const unauthorizedBehavior = options.on401 || "throw";
    try {
      const url = queryKey[0] as string;
      console.log(`Making API request to: ${url}`, { queryKey });
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as any;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

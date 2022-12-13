import type { HttpMethod } from "@sveltejs/kit/types/private";

const ServerUrl = "http://localhost:9080";

export async function fetchWrapper(path: string, method: HttpMethod, data?: any) {
  const resp = await fetch(`${ServerUrl}${path}`, {
    method,
    ...(data ? { body: JSON.stringify(data) } : {}),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await resp.json();
}

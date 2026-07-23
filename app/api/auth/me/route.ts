import { success } from "@/lib/api-utils";
import { getUser } from "@/lib/get-user";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return success({ user });
}

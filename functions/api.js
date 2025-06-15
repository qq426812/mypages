export async function onRequest(context) {
return new Response("Hello, world!");
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === "POST") {
    const data = await request.json();
    const content = data?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    await env.DB.prepare(
      `INSERT INTO records (content, created_at) VALUES (?, datetime('now'))`
    ).bind(content).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
    });
  }

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, content, created_at FROM records ORDER BY created_at DESC LIMIT 100"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
}

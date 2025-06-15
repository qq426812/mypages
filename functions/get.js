export const onRequestGet = async ({ request, env }) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "缺少参数 id" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const stmt = env.DB.prepare("SELECT content FROM records WHERE id = ?");
    const row = await stmt.bind(id).first();

    if (!row) {
      return new Response(JSON.stringify({ success: false, error: "未找到内容" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, content: row.content }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

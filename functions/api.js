export const onRequest = async (context) => {
  const { request, env } = context;
  const { method } = request;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // ✅ 路由分发：/api/latest 获取最新一条记录
  if (method === "GET" && pathname.endsWith("/latest")) {
    try {
      const stmt = env.DB.prepare("SELECT id FROM records ORDER BY id DESC LIMIT 1");
      const row = await stmt.first();

      if (!row) {
        return new Response(JSON.stringify({ success: false, error: "没有数据" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true, id: row.id }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  // ✅ 提交数据
  if (method === "POST") {
    try {
      const body = await request.json();
      const content = body.content?.trim();

      if (!content) {
        return new Response(JSON.stringify({ success: false, error: "内容为空" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const now = new Date().toISOString();
      const stmt = env.DB.prepare(
        "INSERT INTO records (content, created_at) VALUES (?, ?)"
      );
      await stmt.bind(content, now).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response(JSON.stringify({ error: "方法不支持" }), {
    status: 405,
    headers: corsHeaders,
  });
};

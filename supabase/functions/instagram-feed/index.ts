const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  if (!accessToken) {
    return Response.json({ error: "Instagram feed belum dikonfigurasi.", items: [] }, {
      status: 503,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }

  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url");
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const result = await response.json();
    if (!response.ok || !Array.isArray(result.data)) {
      console.error("Instagram Graph API error", result.error?.message ?? response.status);
      return Response.json({ error: "Posting Instagram belum dapat dimuat.", items: [] }, {
        status: 502,
        headers: { ...corsHeaders, "Cache-Control": "no-store" },
      });
    }

    const items = result.data
      .filter((post: Record<string, unknown>) => post.media_type === "IMAGE" || post.media_type === "VIDEO" || post.media_type === "CAROUSEL_ALBUM")
      .sort((a: Record<string, string>, b: Record<string, string>) => Date.parse(b.timestamp || "") - Date.parse(a.timestamp || ""))
      .slice(0, 3)
      .map((post: Record<string, unknown>) => ({
        id: post.id,
        caption: post.caption,
        media_type: post.media_type,
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
      }));

    return Response.json({ items }, {
      headers: { ...corsHeaders, "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (error) {
    console.error("Instagram feed request failed", error);
    return Response.json({ error: "Posting Instagram belum dapat dimuat.", items: [] }, {
      status: 502,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }
});

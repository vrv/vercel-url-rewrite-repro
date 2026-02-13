import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.url;
  const nextUrl = request.nextUrl.toString();
  const redirectUri = request.nextUrl.searchParams.get("redirect_uri");

  // Also try to get the raw query string from headers
  const xForwardedHost = request.headers.get("x-forwarded-host");
  const xForwardedProto = request.headers.get("x-forwarded-proto");
  const xVercelId = request.headers.get("x-vercel-id");

  return Response.json({
    request_url: url,
    nextUrl: nextUrl,
    redirect_uri_parsed: redirectUri,
    headers: {
      "x-forwarded-host": xForwardedHost,
      "x-forwarded-proto": xForwardedProto,
      "x-vercel-id": xVercelId,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  return Response.json({
    raw_body: body,
    redirect_uri_from_body: params.get("redirect_uri"),
  });
}

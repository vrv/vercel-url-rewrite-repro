# Vercel rewrites 127.0.0.1 to localhost in query parameters

Minimal reproduction showing that Vercel's infrastructure silently rewrites `127.0.0.1` to `localhost` in GET query parameter **values**, but **not** in POST request bodies.

## Reproduction

1. Deploy to Vercel:

```bash
npm install
npx vercel --prod
```

2. Test GET (query parameter):

```bash
curl -s 'https://<your-deployment>.vercel.app/api/echo?foo=http%3A%2F%2F127.0.0.1%3A12345%2Ftest' | jq
```

Result — `127.0.0.1` is rewritten to `localhost`:

```json
{
  "request_url": "https://<deployment>/api/echo?foo=http%3A%2F%2Flocalhost%3A12345%2Ftest",
  "nextUrl": "https://<deployment>/api/echo?foo=http%3A%2F%2Flocalhost%3A12345%2Ftest",
  "redirect_uri_parsed": "http://localhost:12345/test"
}
```

3. Test POST (request body):

```bash
curl -s -X POST 'https://<your-deployment>.vercel.app/api/echo' \
  -d 'foo=http%3A%2F%2F127.0.0.1%3A12345%2Ftest' | jq
```

Result — `127.0.0.1` is preserved:

```json
{
  "raw_body": "foo=http%3A%2F%2F127.0.0.1%3A12345%2Ftest",
  "redirect_uri_from_body": "http://127.0.0.1:12345/test"
}
```

4. Verify locally (no rewriting):

```bash
npm run dev
curl -s 'http://localhost:3000/api/echo?foo=http%3A%2F%2F127.0.0.1%3A12345%2Ftest' | jq
```

Local Next.js dev server preserves `127.0.0.1` — confirming the rewrite is Vercel's infrastructure, not Next.js.

## Notes

- Node.js `new URL()` does **not** perform this normalization — `new URL("http://example.com?r=http%3A%2F%2F127.0.0.1").searchParams.get("r")` returns `http://127.0.0.1`
- The rewrite applies to URL-encoded values **inside** query parameters, not just the top-level URL hostname
- This means GET and POST requests to the same Vercel deployment can receive different values for the same parameter
- Tested on February 12, 2026 with Next.js 15 on Vercel

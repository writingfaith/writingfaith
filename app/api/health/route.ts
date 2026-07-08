export function GET() {
  return Response.json(
    {
      ok: true,
      service: "writingfaith",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

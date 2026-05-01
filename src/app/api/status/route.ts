import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing FASHN_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required query parameter "id".' },
      { status: 400 },
    );
  }

  const upstream = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  let data: unknown = null;
  try {
    data = await upstream.json();
  } catch {
    data = { error: "Upstream response was not JSON." };
  }

  console.log(data);

  return NextResponse.json(data, { status: upstream.status });
}


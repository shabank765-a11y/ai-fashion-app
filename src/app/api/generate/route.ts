import { NextResponse } from "next/server";

const simplePrompt =
  "full outfit virtual try-on, replace entire clothing, apply both upper and lower garments from the product image, ensure accurate fit on torso and legs, correct proportions, natural draping, realistic fashion photography, no original clothing visible";

const advancedPrompt =
  "the input image contains two garments. the left side is the top garment and the right side is the bottom garment. apply both garments separately to the model. preserve exact design, structure, button count, embroidery, and proportions of each garment. do not mix or blend them. do not add or remove any elements. do not modify garment shape or length.";

export async function POST(req: Request) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing FASHN_API_KEY environment variable." },
      { status: 500 },
    );
  }

  try {
    const { product_image, model_image, mode } = (await req.json()) as {
      product_image?: unknown;
      model_image?: unknown;
      mode?: unknown;
    };

    if (typeof model_image !== "string" || !model_image) {
      return NextResponse.json(
        { error: 'Missing required field "model_image" in request body.' },
        { status: 400 },
      );
    }

    if (typeof product_image !== "string" || !product_image) {
      return NextResponse.json(
        { error: 'Missing required field "product_image" in request body.' },
        { status: 400 },
      );
    }

    const fullModelImage = model_image.startsWith("/models")
      ? `http://localhost:3000${model_image}`
      : model_image;

    const fashnBody = {
      model_name: "tryon-max",
      generation_mode: "quality",
      inputs: {
        model_image: fullModelImage,
        product_image,
        prompt: mode === "advanced" ? advancedPrompt : simplePrompt,
        num_images: 1,
      },
    };

    const upstream = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(fashnBody),
    });

    const text = await upstream.text();
    console.log(text);

    try {
      const responseJson = JSON.parse(text) as unknown;
      console.log(responseJson);
      return NextResponse.json(responseJson, {
        status: upstream.status,
      });
    } catch {
      return NextResponse.json(
        { error: "Upstream response was not JSON.", raw: text },
        { status: upstream.status },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }
}


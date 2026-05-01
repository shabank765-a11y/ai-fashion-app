"use client";

import { useEffect, useState } from "react";

const models = [
  // FEMALE MODELS
  { id: "female1", gender: "female", image: "/models/female/female1.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573586/female1_wps2vi.jpg" },
  { id: "female2", gender: "female", image: "/models/female/female2.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573605/female2_swbtec.jpg" },
  { id: "female3", gender: "female", image: "/models/female/female3.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573612/female3_jzbnvv.jpg" },
  { id: "female4", gender: "female", image: "/models/female/female4.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573622/female4_opphec.jpg" },
  { id: "female5", gender: "female", image: "/models/female/female5.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573626/female5_gidhbt.jpg" },
  { id: "female6", gender: "female", image: "/models/female/female6.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573633/female6_jdsezs.jpg" },
  { id: "female7", gender: "female", image: "/models/female/female7.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573639/female7_kzkfkc.jpg" },
  { id: "female8", gender: "female", image: "/models/female/female8.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573646/female8_nrj7vj.jpg" },
  { id: "female9", gender: "female", image: "/models/female/female9.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573654/female9_u5kcz7.jpg" },
  { id: "female10", gender: "female", image: "/models/female/female10.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573667/female10_h3hxvc.jpg" },
  { id: "female11", gender: "female", image: "/models/female/female11.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573679/female11_avnjab.jpg" },

  // MALE MODELS
  { id: "male1", gender: "male", image: "/models/male/male1.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573709/male1_kny05k.jpg" },
  { id: "male2", gender: "male", image: "/models/male/male2.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573714/male2_vf7sch.jpg" },
  { id: "male3", gender: "male", image: "/models/male/male3.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573723/male3_ft3wet.jpg" },
  { id: "male5", gender: "male", image: "/models/male/male5.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573730/male5_deywqf.jpg" },
  { id: "male6", gender: "male", image: "/models/male/male6.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573734/male6_wkdqd0.jpg" },
  { id: "male7", gender: "male", image: "/models/male/male7.jpg", apiImage: "https://res.cloudinary.com/decinhcwo/image/upload/v1777573741/male7_oyxejn.jpg" },
];

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    img.src = url;
  });
}

async function resizeImageToMinDataUrl(
  file: File,
  minSize = 512,
): Promise<string> {
  const img = await loadImageFromFile(file);

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) throw new Error("Invalid image dimensions.");

  const scale = Math.max(minSize / srcW, minSize / srcH, 1);
  const dstW = Math.round(srcW * scale);
  const dstH = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, dstW, dstH);

  // Produces: data:image/jpeg;base64,...
  return canvas.toDataURL("image/jpeg", 0.92);
}

const mergeImages = async (topFile: File, bottomFile: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const topImg = new Image();
    const bottomImg = new Image();

    topImg.src = URL.createObjectURL(topFile);
    bottomImg.src = URL.createObjectURL(bottomFile);

    topImg.onload = () => {
      bottomImg.onload = () => {
        const spacing = 40;

        canvas.width = topImg.width + spacing + bottomImg.width;
        canvas.height = Math.max(topImg.height, bottomImg.height);

        if (!ctx) return resolve(new Blob());
        ctx.drawImage(topImg, 0, 0);
        ctx.drawImage(bottomImg, topImg.width + spacing, 0);

        canvas.toBlob((blob) => {
          resolve(blob ?? new Blob());
        }, "image/jpeg");
      };
    };
  });
};

const MAX_API_IMAGE_WIDTH = 800;
const API_JPEG_QUALITY = 0.7;

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const fullUrl =
    typeof window !== "undefined" && url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error("Failed to load image.");
  return res.blob();
}

function compressImageElementToJpegDataUrl(
  img: HTMLImageElement,
  maxWidth = MAX_API_IMAGE_WIDTH,
  quality = API_JPEG_QUALITY,
): string {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) throw new Error("Invalid image dimensions.");

  let dstW = srcW;
  let dstH = srcH;
  if (srcW > maxWidth) {
    dstW = maxWidth;
    dstH = Math.round((srcH * maxWidth) / srcW);
  }

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, dstW, dstH);

  return canvas.toDataURL("image/jpeg", quality);
}

async function compressImageFileOrBlobToJpegDataUrl(
  input: File | Blob,
  maxWidth = MAX_API_IMAGE_WIDTH,
  quality = API_JPEG_QUALITY,
): Promise<string> {
  const file =
    input instanceof File
      ? input
      : new File([input], "image.jpg", { type: input.type || "image/jpeg" });
  const img = await loadImageFromFile(file);
  return compressImageElementToJpegDataUrl(img, maxWidth, quality);
}

async function compressImageFromUrlToJpegDataUrl(
  url: string,
  maxWidth = MAX_API_IMAGE_WIDTH,
  quality = API_JPEG_QUALITY,
): Promise<string> {
  const blob = await fetchImageAsBlob(url);
  return compressImageFileOrBlobToJpegDataUrl(blob, maxWidth, quality);
}

function getErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (!("error" in value)) return null;
  const e = (value as { error?: unknown }).error;
  return typeof e === "string" ? e : null;
}

function getId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

function getOutputImage0(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const output = (value as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  const first = output[0];
  return typeof first === "string" ? first : null;
}

export default function Home() {
  const [garmentBase64, setGarmentBase64] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [topImage, setTopImage] = useState<File | null>(null);
  const [bottomImage, setBottomImage] = useState<File | null>(null);
  const [topPreview, setTopPreview] = useState<string | null>(null);
  const [bottomPreview, setBottomPreview] = useState<string | null>(null);
  const [mode, setMode] = useState("simple");
  const [selectedGender, setSelectedGender] = useState("female");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const filteredModels = models.filter(
    (model) => model.gender === selectedGender,
  );

  useEffect(() => {
    if (!productPreview) return;
    return () => URL.revokeObjectURL(productPreview);
  }, [productPreview]);

  useEffect(() => {
    if (!jobId) return;
    if (jobStatus === "completed" || jobStatus === "failed") return;

    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${encodeURIComponent(jobId)}`);
        const data: unknown = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(getErrorMessage(data) ?? "Status request failed.");
        }

        const status =
          data && typeof data === "object"
            ? ((data as { status?: unknown }).status as unknown)
            : null;

        if (typeof status === "string") setJobStatus(status);

        if (status === "completed") {
          const img = getOutputImage0(data);
          if (!img) throw new Error("No output image found.");
          setGeneratedImageUrl(img);
        }

        if (status === "failed") {
          throw new Error(getErrorMessage(data) ?? "Generation failed.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setJobStatus("failed");
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [jobId, jobStatus]);

  async function handleGenerate() {
    if (isLoading) return;

    if (mode === "simple") {
      if (!productImage) {
        alert("Please upload an outfit image");
        return;
      }
    }

    if (mode === "advanced") {
      if (!topImage || !bottomImage) {
        alert("Please upload both top and bottom images");
        return;
      }
    }

    let finalImage: Blob | File | null = null;

    if (mode === "simple") {
      finalImage = productImage;
    } else if (mode === "advanced") {
      finalImage = await mergeImages(topImage!, bottomImage!);
    }

    if (!finalImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const productFileOrBlob =
        finalImage instanceof File
          ? finalImage
          : new File([finalImage], "product.jpg", { type: "image/jpeg" });
      const productBase64 =
        await compressImageFileOrBlobToJpegDataUrl(productFileOrBlob);
      const modelBase64 = await compressImageFromUrlToJpegDataUrl(
        selectedModel.apiImage,
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_image: modelBase64,
          product_image: productBase64,
          mode,
        }),
      });

      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getErrorMessage(data) ?? "Request failed.");
      }

      const id = getId(data);
      if (!id) throw new Error('No "id" returned from /api/generate.');
      setJobId(id);
      setJobStatus("processing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = async () => {
    const resultImage = generatedImageUrl;
    if (!resultImage) return;

    const response = await fetch(resultImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tryon-result.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const isDisabled =
    (mode === "simple" && !productImage) ||
    (mode === "advanced" && (!topImage || !bottomImage)) ||
    isLoading;

  return (
    <main className="min-h-screen bg-white px-6 text-zinc-900 antialiased">
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center text-center">
          <h1 className="text-center text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Generate product photos for your clothing brand instantly
          </h1>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-800 sm:text-4xl">
            AI Fashion Studio
          </h2>
          <p className="mt-4 text-lg text-zinc-600 sm:text-xl">
            From product image to model photo in seconds
          </p>

          <div className="mt-10 w-full">
            <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-3">
              <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedGender("female");
                  const firstFemale = models.find((m) => m.gender === "female");
                  setSelectedModel(firstFemale ?? models[0]);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  marginRight: "10px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    selectedGender === "female" ? "#007bff" : "white",
                  color: selectedGender === "female" ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGender("male");
                  const firstMale = models.find((m) => m.gender === "male");
                  setSelectedModel(firstMale ?? models[0]);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  marginRight: "10px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    selectedGender === "male" ? "#007bff" : "white",
                  color: selectedGender === "male" ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                Male
              </button>
            </div>

            <h2 className="mt-4 text-left text-lg font-semibold">
              Select a Model
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "15px",
              }}
            >
              {filteredModels.map((model) => (
                <img
                  key={model.id}
                  src={model.image}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    borderRadius: "10px",
                    objectFit: "cover",
                    height: "180px",
                    border:
                      selectedModel.id === model.id
                        ? "3px solid #007bff"
                        : "1px solid gray",
                    transform:
                      selectedModel.id === model.id ? "scale(1.03)" : "scale(1)",
                  }}
                  onClick={() => setSelectedModel(model)}
                />
              ))}
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setMode("simple");
                  setTopImage(null);
                  setBottomImage(null);
                  setTopPreview(null);
                  setBottomPreview(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  marginRight: "10px",
                  border: "1px solid #ccc",
                  backgroundColor: mode === "simple" ? "#007bff" : "white",
                  color: mode === "simple" ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                Simple Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("advanced");
                  setProductImage(null);
                  setProductPreview(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  marginRight: "10px",
                  border: "1px solid #ccc",
                  backgroundColor: mode === "advanced" ? "#007bff" : "white",
                  color: mode === "advanced" ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                Advanced Mode
              </button>
            </div>

            {mode === "simple" ? (
              <>
                <h3 className="text-left text-sm font-medium text-zinc-700">
                  Upload Outfit
                </h3>

                {mode === "simple" && productPreview ? (
                  <div className="text-left">
                    <img
                      src={productPreview}
                      style={{
                        width: "200px",
                        borderRadius: "10px",
                        marginTop: "10px",
                      }}
                      alt="Product preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductImage(null);
                        setProductPreview(null);
                        setGarmentBase64(null);
                      }}
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProductImage(file);
                        setProductPreview(URL.createObjectURL(file));
                      }

                      setGeneratedImageUrl(null);
                      setJobId(null);
                      setJobStatus(null);
                      setError(null);

                      if (!file) {
                        setProductImage(null);
                        setProductPreview(null);
                        setGarmentBase64(null);
                        return;
                      }

                      try {
                        const dataUrl = await resizeImageToMinDataUrl(file, 512);
                        setGarmentBase64(dataUrl);
                      } catch (err) {
                        setGarmentBase64(null);
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Failed to read file.",
                        );
                      }
                    }}
                    className="mt-2 block w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200"
                  />
                )}
              </>
            ) : (
              <>
                <div className="text-left">
                  <h3>Upload Top</h3>
                  <div
                    style={{
                      border: "2px dashed #ccc",
                      borderRadius: "12px",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="topUpload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTopImage(file);
                          setTopPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    <label htmlFor="topUpload" style={{ cursor: "pointer" }}>
                      {mode === "advanced" && topPreview ? (
                        <div style={{ position: "relative" }}>
                          <img
                            src={topPreview}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                            alt="Top preview"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTopImage(null);
                              setTopPreview(null);
                            }}
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "25px",
                              height: "25px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p>Click to upload Top</p>
                      )}
                    </label>
                  </div>
                </div>

                <div className="text-left">
                  <h3>Upload Bottom</h3>
                  <div
                    style={{
                      border: "2px dashed #ccc",
                      borderRadius: "12px",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="bottomUpload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBottomImage(file);
                          setBottomPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    <label htmlFor="bottomUpload" style={{ cursor: "pointer" }}>
                      {mode === "advanced" && bottomPreview ? (
                        <div style={{ position: "relative" }}>
                          <img
                            src={bottomPreview}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                            alt="Bottom preview"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setBottomImage(null);
                              setBottomPreview(null);
                            }}
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "25px",
                              height: "25px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p>Click to upload Bottom</p>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}

            <p style={{ fontSize: "14px", color: "gray" }}>
              Use clear, front-facing outfit images for best results
            </p>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isDisabled}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Generating..." : "Generate Product Photo"}
            </button>

            {isLoading && (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <p>Generating your product image...</p>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "4px solid #ccc",
                    borderTop: "4px solid #007bff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "10px auto",
                  }}
                />
              </div>
            )}
          </div>

          {error ? (
            <p className="mx-auto mt-4 max-w-md text-sm text-red-600">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="mx-auto mt-6 max-w-md text-sm text-zinc-600">
              Uploading…
            </p>
          ) : null}

          {jobId && jobStatus && jobStatus !== "completed" && jobStatus !== "failed" ? (
            <p className="mx-auto mt-6 max-w-md text-sm text-zinc-600">
              Processing…
            </p>
          ) : null}

          {mode === "simple" && garmentBase64 ? (
            <div className="mx-auto mt-10 w-full max-w-md">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <img
                  src={garmentBase64}
                  alt="Selected garment preview"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          ) : null}

          {generatedImageUrl ? (
            <div className="mx-auto mt-6 w-full max-w-md">
              <h3>Generated Product Image</h3>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <img
                  src={generatedImageUrl}
                  alt="Generated result"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "12px",
                    marginTop: "15px",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Download Image
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#0056b3";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#007bff";
                }}
              >
                Generate Again
              </button>
            </div>
          ) : (
            <div className="mx-auto mt-10 w-full max-w-md px-4">
              <p className="text-center text-base leading-relaxed text-zinc-500">
                Select a model and upload outfit to start
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

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

function IconOutlineImage({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.75" cy="8.75" r="1.5" fill="currentColor" />
      <polyline
        points="21 15 16 10 5 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOutlineUser({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOutlineZap({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M13 2.5L4.5 14H11l-1.5 7.5L19.5 10H13L13 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
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

  const uploadZoneStyle: CSSProperties = {
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.55)",
  };

  const primaryBtn: CSSProperties = {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  };

  const secondaryToggle = (selected: boolean): CSSProperties => ({
    padding: "12px 20px",
    borderRadius: "10px",
    marginRight: "10px",
    border: selected ? "1px solid #111827" : "1px solid #d1d5db",
    backgroundColor: selected ? "#111827" : "#ffffff",
    color: selected ? "#ffffff" : "#374151",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  });

  return (
    <main
      className="min-h-screen antialiased"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #ffffff, #f1f5f9)",
        color: "#111827",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: "60px",
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          paddingLeft: "20px",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
          Modelize
        </span>
      </header>

      <div
        className="mx-auto w-full"
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <div className="mb-12 text-center">
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 32px)",
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.25,
              letterSpacing: "-0.3px",
            }}
          >
            Generate product photos for your clothing brand instantly
          </h1>
          <h2
            className="mt-4"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "-0.2px",
            }}
          >
            AI Fashion Studio
          </h2>
          <p
            className="mt-2"
            style={{
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            From product image to model photo in seconds
          </p>
        </div>

        <div
          className="flex w-full flex-col"
          style={{ gap: "22px", alignItems: "stretch" }}
        >
          <section className="saas-card">
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
              >
              <button
                type="button"
                className={
                  selectedGender === "female"
                    ? "saas-btn-solid"
                    : "saas-btn-outline"
                }
                onClick={() => {
                  setSelectedGender("female");
                  const firstFemale = models.find((m) => m.gender === "female");
                  setSelectedModel(firstFemale ?? models[0]);
                }}
                style={secondaryToggle(selectedGender === "female")}
              >
                Female
              </button>
              <button
                type="button"
                className={
                  selectedGender === "male"
                    ? "saas-btn-solid"
                    : "saas-btn-outline"
                }
                onClick={() => {
                  setSelectedGender("male");
                  const firstMale = models.find((m) => m.gender === "male");
                  setSelectedModel(firstMale ?? models[0]);
                }}
                style={secondaryToggle(selectedGender === "male")}
              >
                Male
              </button>
            </div>

            <div
              className="mt-6"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: "#6b7280",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                <IconOutlineUser size={18} />
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Select Model
              </h2>
            </div>

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
                  className={
                    selectedModel.id === model.id
                      ? "saas-model-thumb saas-model-thumb--selected"
                      : "saas-model-thumb"
                  }
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    borderRadius: "12px",
                    objectFit: "cover",
                    height: "180px",
                    border:
                      selectedModel.id === model.id
                        ? "2px solid #111827"
                        : "1px solid #e5e7eb",
                  }}
                  onClick={() => setSelectedModel(model)}
                />
              ))}
            </div>
          </section>

          <hr className="saas-divider" />

          <section className="saas-card">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                className={
                  mode === "simple" ? "saas-btn-solid" : "saas-btn-outline"
                }
                onClick={() => {
                  setMode("simple");
                  setTopImage(null);
                  setBottomImage(null);
                  setTopPreview(null);
                  setBottomPreview(null);
                }}
                style={secondaryToggle(mode === "simple")}
              >
                Simple Mode
              </button>
              <button
                type="button"
                className={
                  mode === "advanced" ? "saas-btn-solid" : "saas-btn-outline"
                }
                onClick={() => {
                  setMode("advanced");
                  setProductImage(null);
                  setProductPreview(null);
                }}
                style={secondaryToggle(mode === "advanced")}
              >
                Advanced Mode
              </button>
            </div>

            {mode === "simple" ? (
              <>
                <div
                  className="mt-1"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      color: "#6b7280",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    <IconOutlineImage size={18} />
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    Upload Image
                  </h3>
                </div>

                {mode === "simple" && productPreview ? (
                  <div className="text-center">
                    <img
                      src={productPreview}
                      style={{
                        width: "200px",
                        maxWidth: "100%",
                        borderRadius: "12px",
                        marginTop: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                      }}
                      alt="Product preview"
                    />
                    <button
                      type="button"
                      className="saas-btn-outline"
                      onClick={() => {
                        setProductImage(null);
                        setProductPreview(null);
                        setGarmentBase64(null);
                      }}
                      style={{
                        marginTop: "14px",
                        padding: "12px 20px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="saas-upload-zone mt-3" style={uploadZoneStyle}>
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
                    className="block w-full cursor-pointer bg-transparent px-1 py-1 text-sm text-zinc-700 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
                  />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-left">
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111827",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Upload Top
                  </h3>
                  <div className="saas-upload-zone" style={uploadZoneStyle}>
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
                              borderRadius: "12px",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                            }}
                            alt="Top preview"
                          />
                          <button
                            type="button"
                            className="saas-btn-scale"
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
                              background: "#6b7280",
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
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111827",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Upload Bottom
                  </h3>
                  <div className="saas-upload-zone" style={uploadZoneStyle}>
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
                              borderRadius: "12px",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                            }}
                            alt="Bottom preview"
                          />
                          <button
                            type="button"
                            className="saas-btn-scale"
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
                              background: "#6b7280",
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

            {mode === "simple" && garmentBase64 ? (
              <div style={{ marginTop: "16px", marginBottom: "20px" }}>
                <img
                  src={garmentBase64}
                  alt="Selected garment preview"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    marginTop: "15px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                  }}
                />
              </div>
            ) : null}

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              Use clear, front-facing outfit images for best results
            </p>

            <button
              type="button"
              className="saas-btn-primary"
              onClick={handleGenerate}
              disabled={isDisabled}
              style={{
                ...primaryBtn,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                marginTop: "10px",
                fontSize: "15px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                backgroundColor: isDisabled ? "#9ca3af" : "#111827",
                opacity: isDisabled ? 0.85 : 1,
                color: "#ffffff",
              }}
            >
              <span style={{ display: "flex", flexShrink: 0 }} aria-hidden>
                <IconOutlineZap size={17} />
              </span>
              <span>{isLoading ? "Generating..." : "Generate Product Photo"}</span>
            </button>

            {isLoading ? (
              <div style={{ marginTop: "18px", textAlign: "center" }}>
                <p className="text-sm text-zinc-600">
                  Generating your product image...
                </p>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #111827",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "10px auto",
                  }}
                />
              </div>
            ) : null}
          </section>

          <hr className="saas-divider" />

          <section className="saas-card">
            {error ? (
              <p className="mb-4 text-left text-sm text-red-600">{error}</p>
            ) : null}

            {isLoading ? (
              <p className="mb-2 text-center text-sm text-zinc-600">
                Uploading…
              </p>
            ) : null}

            {jobId && jobStatus && jobStatus !== "completed" && jobStatus !== "failed" ? (
              <p className="mb-2 text-center text-sm text-zinc-600">
                Processing…
              </p>
            ) : null}

            {generatedImageUrl ? (
              <div className="w-full">
                <h3
                  className="mb-2"
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#111827",
                    textAlign: "center",
                  }}
                >
                  Generated Product Image
                </h3>
                <p
                  style={{
                    margin: "6px 0 10px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#16a34a",
                  }}
                >
                  Image generated successfully
                </p>
                <div
                  key={generatedImageUrl}
                  className="saas-result-image-wrap overflow-hidden rounded-xl border border-zinc-200/70 bg-transparent"
                  style={{
                    maxWidth: "400px",
                    margin: "15px auto 0",
                  }}
                >
                  <img
                    src={generatedImageUrl}
                    alt="Generated result"
                    style={{
                      display: "block",
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.09)",
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="saas-btn-outline"
                  onClick={handleDownload}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Download Image
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  style={{
                    display: "block",
                    marginTop: "10px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e8eaed",
                    backgroundColor: "#fafbfc",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    boxShadow: "none",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f4f5f7";
                    e.currentTarget.style.borderColor = "#d8dce2";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#fafbfc";
                    e.currentTarget.style.borderColor = "#e8eaed";
                  }}
                >
                  Generate Again
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "280px",
                  padding: "32px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "18px",
                    maxWidth: "300px",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "72px",
                      height: "72px",
                      borderRadius: "12px",
                      color: "#9ca3af",
                      backgroundColor: "rgba(156, 163, 175, 0.12)",
                      border: "1px solid rgba(156, 163, 175, 0.22)",
                    }}
                  >
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle cx="8.75" cy="8.75" r="1.5" fill="currentColor" />
                      <polyline
                        points="21 15 16 10 5 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: 1.55,
                      color: "#9ca3af",
                    }}
                  >
                    Your generated product image will appear here
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer
          style={{
            marginTop: "30px",
            paddingBottom: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "#9ca3af",
            letterSpacing: "0.01em",
          }}
        >
          Built for clothing brands
        </footer>
      </div>
    </main>
  );
}

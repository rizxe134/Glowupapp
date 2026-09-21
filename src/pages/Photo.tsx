import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BODY_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  DEFAULT_VISION_MODEL,
  HAIR_CONCERN_OPTIONS,
  HAIR_TYPE_OPTIONS,
  LOW_RAM_VISION_MODEL,
  SCALP_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  SKIN_TYPE_OPTIONS,
  analysisToAnswers,
  type BodyConcern,
  type Budget,
  type HairConcern,
  type HairType,
  type PhotoAnalysis,
  type ScalpType,
  type SkinConcern,
  type SkinType,
} from "@glow/shared";
import Shell from "../components/Shell";
import {
  analyzePhotoWithOllama,
  checkOllama,
  visionModelName,
  type OllamaStatus,
} from "../lib/ollama";
import { saveSession } from "../lib/session";

function Chip<T extends string>({
  id,
  label,
  on,
  onToggle,
}: {
  id: T;
  label: string;
  on: boolean;
  onToggle: (id: T) => void;
}) {
  return (
    <button type="button" className={`chip${on ? " is-on" : ""}`} onClick={() => onToggle(id)}>
      {label}
    </button>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function canvasFromVideo(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not capture a frame.");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function Photo() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<OllamaStatus>({ state: "unknown" });
  const [image, setImage] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [budget, setBudget] = useState<Budget>("drugstore");
  const model = visionModelName();

  useEffect(() => {
    void checkOllama().then(setStatus);
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError("Camera permission was denied. You can still drop an image or pick from files.");
    }
  }

  function captureFrame() {
    if (!videoRef.current) return;
    const data = canvasFromVideo(videoRef.current);
    setImage(data);
    setAnalysis(null);
    stopCamera();
  }

  async function onFiles(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please drop a photo (jpg, png, webp, heic if your browser can read it).");
      return;
    }
    const data = await fileToDataUrl(file);
    setImage(data);
    setAnalysis(null);
    setError(null);
    stopCamera();
  }

  async function analyze() {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const result = await analyzePhotoWithOllama(image);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  function toggleSkin(id: SkinConcern) {
    if (!analysis) return;
    const has = analysis.skinConcerns.includes(id);
    const skinConcerns = has
      ? analysis.skinConcerns.filter((c) => c !== id)
      : [...analysis.skinConcerns, id].slice(-4);
    setAnalysis({ ...analysis, skinConcerns });
  }

  function toggleHair(id: HairConcern) {
    if (!analysis) return;
    const has = analysis.hairConcerns.includes(id);
    const hairConcerns = has
      ? analysis.hairConcerns.filter((c) => c !== id)
      : [...analysis.hairConcerns, id].slice(-3);
    setAnalysis({ ...analysis, hairConcerns });
  }

  function toggleBody(id: BodyConcern) {
    if (!analysis) return;
    if (id === "none") {
      setAnalysis({ ...analysis, bodyConcerns: ["none"] });
      return;
    }
    const without = analysis.bodyConcerns.filter((c) => c !== "none");
    const has = without.includes(id);
    const bodyConcerns = has ? without.filter((c) => c !== id) : [...without, id].slice(-4);
    setAnalysis({ ...analysis, bodyConcerns: bodyConcerns.length ? bodyConcerns : ["none"] });
  }

  function buildRoutine() {
    if (!analysis) return;
    const answers = analysisToAnswers(analysis, budget);
    saveSession(answers, "photo", analysis.notes);
    navigate("/results");
  }

  const ready =
    status.state === "online" && (status.hasPreferred || status.hasVision || Boolean(status.suggested));

  return (
    <Shell
      actions={
        <Link className="ghost" to="/quiz">
          Skip to quiz
        </Link>
      }
    >
      <div className="kicker">Photo path · local Ollama only</div>
      <h1 className="quiz-title">Read the room. Then edit the chips.</h1>
      <p className="lede">
        Nothing leaves this computer except a request to Ollama on localhost. Default model{" "}
        <code>{DEFAULT_VISION_MODEL}</code>
        {model !== DEFAULT_VISION_MODEL ? (
          <>
            {" "}
            (this session: <code>{model}</code>)
          </>
        ) : null}
        . Low-RAM fallback: <code>{LOW_RAM_VISION_MODEL}</code>.
      </p>

      {status.state === "unknown" ? <p className="note">Checking Ollama…</p> : null}

      {status.state === "offline" ? (
        <div className="setup">
          <h3>Ollama is not reachable</h3>
          <p className="note">
            The web app proxies <code>/ollama</code> to <code>127.0.0.1:11434</code>. Start the daemon
            on this Mac, then refresh.
          </p>
          <ol>
            <li>
              Install Ollama from <code>https://ollama.com</code>
            </li>
            <li>
              <code>ollama pull {model}</code>
            </li>
            <li>
              <code>OLLAMA_HOST=0.0.0.0:11434 ollama serve</code>
            </li>
            <li>
              Low RAM? <code>ollama pull {LOW_RAM_VISION_MODEL}</code> then restart with{" "}
              <code>OLLAMA_VISION_MODEL={LOW_RAM_VISION_MODEL} npm run dev</code>
            </li>
          </ol>
          <p className="note">Quiz recommendations still work with no model at all.</p>
        </div>
      ) : null}

      {status.state === "online" && !status.hasPreferred ? (
        <div className="setup">
          <h3>{model} is not installed</h3>
          <p className="note">
            Ollama is running. Pull the vision model, or point the app at one you already have.
          </p>
          <ol>
            <li>
              <code>ollama pull {model}</code>
            </li>
            {status.suggested ? (
              <li>
                Detected vision-capable model <code>{status.suggested}</code>. You can set{" "}
                <code>OLLAMA_VISION_MODEL={status.suggested}</code>.
              </li>
            ) : (
              <li>
                Low-RAM fallback: <code>ollama pull {LOW_RAM_VISION_MODEL}</code>
              </li>
            )}
          </ol>
        </div>
      ) : null}

      <div
        className={`dropzone${drag ? " is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void onFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div>
          <strong>Drop a photo</strong>
          <p className="note">or click to choose a file. Face, hair, or body in daylight is best.</p>
        </div>
      </div>
      <input
        ref={fileRef}
        className="hidden-file"
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => {
          if (e.target.files) void onFiles(e.target.files);
        }}
      />

      <div className="row">
        {!cameraOn ? (
          <button className="secondary" type="button" onClick={() => void startCamera()}>
            Open camera
          </button>
        ) : (
          <>
            <button className="primary" type="button" onClick={captureFrame}>
              Capture
            </button>
            <button className="ghost" type="button" onClick={stopCamera}>
              Close camera
            </button>
          </>
        )}
      </div>

      {cameraOn ? (
        <div style={{ marginTop: 16 }}>
          <video ref={videoRef} className="webcam" autoPlay playsInline muted />
        </div>
      ) : null}

      {image ? (
        <div style={{ marginTop: 18 }}>
          <img className="preview" src={image} alt="Selected for analysis" />
          <div className="row">
            <button className="primary" type="button" disabled={busy || !ready} onClick={() => void analyze()}>
              {busy ? (
                <>
                  <span className="spinner" /> Reading the photo…
                </>
              ) : (
                "Analyze with Ollama"
              )}
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                setImage(null);
                setAnalysis(null);
              }}
            >
              Remove photo
            </button>
          </div>
          {!ready ? (
            <p className="note">Analysis stays disabled until a vision model is available.</p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      {analysis ? (
        <div className="panel" style={{ padding: 22, marginTop: 22 }}>
          <h2>Edit what it noticed</h2>
          <p className="note">
            Confidence: {analysis.confidence}. {analysis.notes || "Tweak anything that looks off."}
          </p>

          <h3 style={{ margin: "18px 0 8px" }}>Skin type</h3>
          <div className="chip-row">
            {SKIN_TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.skinType === opt.id}
                onToggle={(id) => setAnalysis({ ...analysis, skinType: id as SkinType })}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Skin concerns</h3>
          <div className="chip-row">
            {SKIN_CONCERN_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.skinConcerns.includes(opt.id)}
                onToggle={toggleSkin}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Hair type</h3>
          <div className="chip-row">
            {HAIR_TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.hairType === opt.id}
                onToggle={(id) => setAnalysis({ ...analysis, hairType: id as HairType })}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Hair concerns</h3>
          <div className="chip-row">
            {HAIR_CONCERN_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.hairConcerns.includes(opt.id)}
                onToggle={toggleHair}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Scalp</h3>
          <div className="chip-row">
            {SCALP_TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.scalpType === opt.id}
                onToggle={(id) => setAnalysis({ ...analysis, scalpType: id as ScalpType })}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Body</h3>
          <div className="chip-row">
            {BODY_CONCERN_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={analysis.bodyConcerns.includes(opt.id)}
                onToggle={toggleBody}
              />
            ))}
          </div>

          <h3 style={{ margin: "18px 0 8px" }}>Budget</h3>
          <div className="chip-row">
            {BUDGET_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                on={budget === opt.id}
                onToggle={(id) => setBudget(id as Budget)}
              />
            ))}
          </div>

          <div className="row">
            <button
              className="primary"
              type="button"
              disabled={!analysis.skinConcerns.length}
              onClick={buildRoutine}
            >
              Build my routine
            </button>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

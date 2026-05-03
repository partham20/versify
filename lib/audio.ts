import { Platform } from "react-native";
import { supabase } from "./supabase";

// A live recording handle. Held by the caller (e.g. compose screen) so the
// component can track elapsed time + stop when the user clicks again.
export type AudioRecorder = {
  stop: () => Promise<Blob>;
  cancel: () => void;
  startedAt: number;
  mimeType: string;
};

export function isRecordingSupported(): boolean {
  if (Platform.OS !== "web") return false;
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof window.MediaRecorder !== "undefined"
  );
}

// Best-supported MIME type for the current browser. Chrome/Edge/Firefox all
// agree on audio/webm; Safari prefers audio/mp4.
function pickMimeType(): string {
  if (typeof window.MediaRecorder === "undefined") return "audio/webm";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const m of candidates) {
    if (window.MediaRecorder.isTypeSupported(m)) return m;
  }
  return "audio/webm";
}

// Asks for mic access and returns a handle the caller can stop later.
// Throws on permission denial or unsupported environments.
export async function startRecording(): Promise<AudioRecorder> {
  if (!isRecordingSupported()) {
    throw new Error("Microphone recording isn't available in this browser.");
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    // Re-throw with a clearer, user-actionable message based on the DOMException name.
    const name = (e as DOMException).name;
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      throw new Error(
        "No microphone detected. Plug in a mic, or check Windows Settings → Privacy → Microphone → allow apps to access it."
      );
    }
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      throw new Error(
        "Microphone access denied. Click the lock icon in the address bar → Site settings → set Microphone to Allow."
      );
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      throw new Error(
        "Microphone is busy. Close other apps using it (Zoom, Teams, Discord) and try again."
      );
    }
    if (name === "SecurityError") {
      throw new Error(
        "Recording requires a secure context. Open the app over https or http://localhost."
      );
    }
    throw e;
  }
  const mimeType = pickMimeType();
  const recorder = new window.MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();
  const startedAt = Date.now();

  function release() {
    stream.getTracks().forEach((t) => t.stop());
  }

  return {
    startedAt,
    mimeType,
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        if (recorder.state === "inactive") {
          release();
          return reject(new Error("Recording already stopped."));
        }
        recorder.onstop = () => {
          release();
          resolve(new Blob(chunks, { type: mimeType }));
        };
        try {
          recorder.stop();
        } catch (e) {
          release();
          reject(e);
        }
      }),
    cancel: () => {
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {}
      release();
    },
  };
}

// Uploads to the `audio` bucket under <userId>/<timestamp>.<ext>.
// Returns the public URL. Caller stores it on the poem as `audio_url`.
export async function uploadAudio(userId: string, blob: Blob): Promise<string> {
  const mime = blob.type || "audio/webm";
  const ext =
    mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")
      ? "m4a"
      : mime.includes("ogg")
        ? "ogg"
        : mime.includes("mpeg")
          ? "mp3"
          : mime.includes("wav")
            ? "wav"
            : "webm";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("audio")
    .upload(path, blob, { contentType: mime, upsert: false, cacheControl: "3600" });
  if (error) throw error;

  const { data } = supabase.storage.from("audio").getPublicUrl(path);
  return data.publicUrl;
}

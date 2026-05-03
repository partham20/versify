import { Audio } from "expo-av";
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
  if (Platform.OS === "web") {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window.MediaRecorder !== "undefined"
    );
  }
  // On native, expo-av is bundled. Permission is asked at startRecording().
  return true;
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
  if (Platform.OS !== "web") return startNativeRecording();

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

// Native (iOS / Android) recording via expo-av Audio.Recording. Returns the
// same AudioRecorder shape the web flow returns; stop() reads the local file
// URI back as a Blob so the existing uploadAudio() helper works unchanged.
async function startNativeRecording(): Promise<AudioRecorder> {
  const perm = await Audio.requestPermissionsAsync();
  if (!perm.granted) {
    throw new Error(
      "Microphone permission denied. Open Settings → Versify → enable Microphone."
    );
  }
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  try {
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await recording.startAsync();
  } catch (e) {
    throw new Error(`Couldn't start recording: ${(e as Error).message}`);
  }

  const startedAt = Date.now();
  // HIGH_QUALITY produces .m4a / aac on both platforms.
  const mimeType = "audio/m4a";

  return {
    startedAt,
    mimeType,
    stop: async () => {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        throw new Error(`Couldn't stop recording: ${(e as Error).message}`);
      }
      // Restore audio mode so playback in the reader doesn't get stuck on
      // the recording profile.
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}
      const uri = recording.getURI();
      if (!uri) throw new Error("Recording finished but produced no file.");
      const res = await fetch(uri);
      const blob = await res.blob();
      // Some Android variants leave blob.type empty; force the mime so the
      // bucket policy + extension picker pick the right value.
      return blob.type ? blob : new Blob([blob], { type: mimeType });
    },
    cancel: () => {
      recording.stopAndUnloadAsync().catch(() => {});
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
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

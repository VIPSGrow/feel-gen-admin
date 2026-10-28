type CompressionResult = {
  file: File;
  compressed: boolean;
};

const IMAGE_SIZE_THRESHOLD = 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const MAX_VIDEO_DIMENSION = 1280;

export async function compressMediaFile(file: File): Promise<CompressionResult> {
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    return compressImageFile(file);
  }

  if (file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
    return compressVideoFile(file);
  }

  return { file, compressed: false };
}

async function compressImageFile(file: File): Promise<CompressionResult> {
  if (file.size <= IMAGE_SIZE_THRESHOLD) return { file, compressed: false };

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Could not read image: ${file.name}`));
      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is not available in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const outputType = file.type === "image/png" ? "image/webp" : file.type;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, 0.82);
    });
    if (!blob || blob.size >= file.size) return { file, compressed: false };

    const extension = outputType === "image/webp" ? ".webp" : ".jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + extension;
    return {
      file: new File([blob], name, { type: outputType, lastModified: file.lastModified }),
      compressed: true,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressVideoFile(file: File): Promise<CompressionResult> {
  if (file.size <= IMAGE_SIZE_THRESHOLD || typeof MediaRecorder === "undefined") {
    return { file, compressed: false };
  }

  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
  if (!mimeType) return { file, compressed: false };

  const video = document.createElement("video");
  const objectUrl = URL.createObjectURL(file);
  video.preload = "auto";
  video.playsInline = true;
  video.volume = 0;
  video.src = objectUrl;
  let activeStreams: MediaStream[] = [];
  let activeRecorder: MediaRecorder | undefined;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error(`Could not read video: ${file.name}`));
    });

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      return { file, compressed: false };
    }

    const sourceStream = video.captureStream?.();
    if (!sourceStream) return { file, compressed: false };

    const scale = Math.min(1, MAX_VIDEO_DIMENSION / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return { file, compressed: false };

    const videoStream = canvas.captureStream(24);
    activeStreams = [sourceStream, videoStream];
    const stream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...sourceStream.getAudioTracks(),
    ]);
    const chunks: Blob[] = [];

    const blob = await new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 1_500_000,
        audioBitsPerSecond: 128_000,
      });
      activeRecorder = recorder;
      let animationFrame = 0;
      const timeout = window.setTimeout(
        () => {
          if (recorder.state === "recording") recorder.stop();
          reject(new Error(`Video compression timed out: ${file.name}`));
        },
        (video.duration + 30) * 1000
      );

      const drawFrame = () => {
        if (video.ended || video.paused) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        animationFrame = requestAnimationFrame(drawFrame);
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error(`Could not compress video: ${file.name}`));
      recorder.onstop = () => {
        window.clearTimeout(timeout);
        cancelAnimationFrame(animationFrame);
        const result = new Blob(chunks, { type: mimeType });
        if (result.size) resolve(result);
        else reject(new Error(`Could not compress video: ${file.name}`));
      };

      recorder.start();
      video.onended = () => recorder.stop();
      video.play()
        .then(() => {
          drawFrame();
        })
        .catch(() => {
          if (recorder.state === "recording") recorder.stop();
          reject(new Error(`Could not play video for compression: ${file.name}`));
        });
    });

    if (blob.size >= file.size) return { file, compressed: false };

    return {
      file: new File([blob], file.name.replace(/\.[^.]+$/, ".webm"), {
        type: "video/webm",
        lastModified: file.lastModified,
      }),
      compressed: true,
    };
  } finally {
    if (activeRecorder?.state === "recording") activeRecorder.stop();
    activeStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    video.pause();
    URL.revokeObjectURL(objectUrl);
  }
}

/// <reference lib="webworker" />
import { createFile, DataStream, Endianness } from "mp4box";
// Decode once in software. Bounded decoder queue + JPEG snapshots; never retain raw VideoFrames.
self.onmessage = async (e: MessageEvent<{ url: string }>) => {
  let decoder: VideoDecoder | undefined;
  try {
    if (
      typeof VideoDecoder === "undefined" ||
      typeof OffscreenCanvas === "undefined"
    )
      throw Error("WebCodecs unavailable");
    const response = await fetch(e.data.url);
    if (!response.ok) throw Error(`Film request failed: ${response.status}`);
    const file = createFile();
    let offset = 0,
      index = 0,
      pending = 0,
      ended = false,
      flushed = false;
    const queue: EncodedVideoChunk[] = [];
    let canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D;
    function pump() {
      if (!decoder || decoder.state !== "configured") return;
      while (queue.length && decoder.decodeQueueSize < 4 && pending < 3)
        decoder.decode(queue.shift()!);
      if (ended && !queue.length && !flushed) {
        flushed = true;
        decoder
          .flush()
          .then(() => {
            if (pending === 0) self.postMessage({ type: "done", count: index });
          })
          .catch((err) =>
            self.postMessage({ type: "error", message: String(err) }),
          );
      }
    }
    file.onError = (err) =>
      self.postMessage({ type: "error", message: String(err) });
    file.onReady = async (info) => {
      try {
        const track = info.videoTracks[0];
        if (!track || !track.video) throw Error("No video track");
        const entry = file.getTrackById(track.id).mdia.minf.stbl.stsd
          .entries[0] as unknown as {
          avcC?: { write: (s: DataStream) => void };
          hvcC?: { write: (s: DataStream) => void };
        };
        const box = entry.avcC || entry.hvcC;
        let description: ArrayBuffer | undefined;
        if (box) {
          const stream = new DataStream(undefined, 0, Endianness.BIG_ENDIAN);
          box.write(stream);
          description = stream.buffer.slice(8);
        }
        const config: VideoDecoderConfig = {
          codec: track.codec,
          codedWidth: track.video.width,
          codedHeight: track.video.height,
          description,
          hardwareAcceleration: "prefer-software",
        };
        // Extraction must start synchronously before the streamed parser releases mdat buffers.
        file.setExtractionOptions(track.id, null, { nbSamples: 12 });
        file.start();
        const support = await VideoDecoder.isConfigSupported(config);
        if (!support.supported) throw Error("Unsupported video codec");
        const scale = Math.min(1, 960 / track.video.width);
        canvas = new OffscreenCanvas(
          Math.round(track.video.width * scale),
          Math.round(track.video.height * scale),
        );
        ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        self.postMessage({
          type: "meta",
          count: track.nb_samples,
          width: canvas.width,
          height: canvas.height,
          duration: track.duration / track.timescale,
        });
        decoder = new VideoDecoder({
          output: (frame) => {
            const i = index++;
            pending++;
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            frame.close();
            const l = Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3),
              r = Array.from(
                ctx.getImageData(canvas.width - 1, 0, 1, 1).data,
              ).slice(0, 3);
            canvas
              .convertToBlob({ type: "image/jpeg", quality: 0.88 })
              .then((blob) => {
                self.postMessage({
                  type: "frame",
                  index: i,
                  blob,
                  left: l,
                  right: r,
                });
                pending--;
                pump();
                if (flushed && pending === 0)
                  self.postMessage({ type: "done", count: index });
              })
              .catch((err) =>
                self.postMessage({ type: "error", message: String(err) }),
              );
          },
          error: (err) =>
            self.postMessage({ type: "error", message: err.message }),
        });
        decoder.configure(config);
        decoder.addEventListener("dequeue", pump);
        pump();
      } catch (err) {
        self.postMessage({ type: "error", message: String(err) });
      }
    };
    file.onSamples = (_id, _user, samples) => {
      for (const s of samples)
        queue.push(
          new EncodedVideoChunk({
            type: s.is_sync ? "key" : "delta",
            timestamp: Math.round((s.cts / s.timescale) * 1e6),
            duration: Math.round((s.duration / s.timescale) * 1e6),
            data: s.data!,
          }),
        );
      pump();
    };
    const reader = response.body!.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const buf = value.buffer.slice(
        value.byteOffset,
        value.byteOffset + value.byteLength,
      ) as ArrayBuffer & { fileStart: number };
      buf.fileStart = offset;
      offset += value.byteLength;
      if (offset > 128e6)
        throw Error("Film exceeds the 128 MB compressed input budget");
      file.appendBuffer(buf);
    }
    file.flush();
    ended = true;
    pump();
  } catch (err) {
    decoder?.close();
    self.postMessage({ type: "error", message: String(err) });
  }
};

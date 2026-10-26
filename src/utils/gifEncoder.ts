/**
 * Client-Side GIF89a Animation Encoder
 * Generates valid, looping animated GIF Blobs directly in the browser
 * from HTMLCanvasElement or ImageData frame samples.
 */

// 256-color standard color palette
function createStandardPalette(): number[][] {
  const palette: number[][] = [];
  // 6 levels R, 7 levels G, 6 levels B = 252 colors + 4 grayscale anchors
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 7; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([
          Math.round((r * 255) / 5),
          Math.round((g * 255) / 6),
          Math.round((b * 255) / 5),
        ]);
      }
    }
  }
  palette.push([0, 0, 0]);
  palette.push([85, 85, 85]);
  palette.push([170, 170, 170]);
  palette.push([255, 255, 255]);
  return palette;
}

const GLOBAL_PALETTE = createStandardPalette();

function findClosestColorIndex(r: number, g: number, b: number): number {
  let bestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < GLOBAL_PALETTE.length; i++) {
    const pal = GLOBAL_PALETTE[i];
    const dr = r - pal[0];
    const dg = g - pal[1];
    const db = b - pal[2];
    const diff = dr * dr + dg * dg + db * db;
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
      if (diff === 0) break;
    }
  }
  return bestIdx;
}

/**
 * LZW Compression for GIF stream
 */
function lzwEncode(minCodeSize: number, indexedPixels: Uint8Array): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = (1 << 12) - 1;

  const output: number[] = [];
  let curAccum = 0;
  let curBits = 0;

  function writeBits(bits: number, count: number) {
    curAccum |= bits << curBits;
    curBits += count;
    while (curBits >= 8) {
      output.push(curAccum & 0xff);
      curAccum >>= 8;
      curBits -= 8;
    }
  }

  const dict = new Map<number, number>();

  function resetDict() {
    dict.clear();
    for (let i = 0; i < clearCode; i++) {
      dict.set(i, i);
    }
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  resetDict();
  writeBits(clearCode, codeSize);

  let prefix = indexedPixels[0];

  for (let i = 1; i < indexedPixels.length; i++) {
    const k = indexedPixels[i];
    const key = (prefix << 8) | k;
    if (dict.has(key)) {
      prefix = dict.get(key)!;
    } else {
      writeBits(prefix, codeSize);
      if (nextCode < maxCode) {
        dict.set(key, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeBits(clearCode, codeSize);
        resetDict();
      }
      prefix = k;
    }
  }

  writeBits(prefix, codeSize);
  writeBits(eoiCode, codeSize);

  if (curBits > 0) {
    output.push(curAccum & 0xff);
  }

  // Pack into sub-blocks (max 255 bytes each)
  const subBlocks: number[] = [];
  let ptr = 0;
  while (ptr < output.length) {
    const chunkSize = Math.min(255, output.length - ptr);
    subBlocks.push(chunkSize);
    for (let c = 0; c < chunkSize; c++) {
      subBlocks.push(output[ptr + c]);
    }
    ptr += chunkSize;
  }
  subBlocks.push(0); // Block terminator

  return new Uint8Array(subBlocks);
}

/**
 * Creates an animated GIF Blob from an array of ImageData frames.
 */
export function createAnimatedGifBlob(
  frames: ImageData[],
  delayMs: number = 120
): Blob {
  if (frames.length === 0) {
    return new Blob([], { type: 'image/gif' });
  }

  const width = frames[0].width;
  const height = frames[0].height;
  const bytes: number[] = [];

  // 1. Header 'GIF89a'
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 2. Logical Screen Descriptor
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);
  // GCT flag = 1, Color Resolution = 7, Sort = 0, GCT Size = 7 (256 colors) => 0xf7
  bytes.push(0xf7);
  bytes.push(0x00); // Background color index
  bytes.push(0x00); // Pixel aspect ratio

  // 3. Global Color Table (256 * 3 = 768 bytes)
  for (let i = 0; i < 256; i++) {
    const c = GLOBAL_PALETTE[i] || [0, 0, 0];
    bytes.push(c[0], c[1], c[2]);
  }

  // 4. Netscape 2.0 Loop Extension (loop forever)
  bytes.push(0x21, 0xff, 0x0b);
  const netscapeStr = 'NETSCAPE2.0';
  for (let i = 0; i < netscapeStr.length; i++) {
    bytes.push(netscapeStr.charCodeAt(i));
  }
  bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

  const delayHundredths = Math.max(2, Math.round(delayMs / 10));

  // 5. Frames
  for (const frame of frames) {
    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04);
    bytes.push(0x04); // Disposal method
    bytes.push(delayHundredths & 0xff, (delayHundredths >> 8) & 0xff);
    bytes.push(0x00); // Transparent color
    bytes.push(0x00); // Block terminator

    // Image Descriptor
    bytes.push(0x2c);
    bytes.push(0x00, 0x00); // Left 0
    bytes.push(0x00, 0x00); // Top 0
    bytes.push(width & 0xff, (width >> 8) & 0xff);
    bytes.push(height & 0xff, (height >> 8) & 0xff);
    bytes.push(0x00); // No local color table

    // Quantize pixels
    const pixelCount = width * height;
    const indexed = new Uint8Array(pixelCount);
    const data = frame.data;
    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 4;
      indexed[i] = findClosestColorIndex(data[offset], data[offset + 1], data[offset + 2]);
    }

    // LZW sub-blocks
    const minCodeSize = 8;
    bytes.push(minCodeSize);
    const lzwData = lzwEncode(minCodeSize, indexed);
    for (let j = 0; j < lzwData.length; j++) {
      bytes.push(lzwData[j]);
    }
  }

  // 6. Trailer
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}

/**
 * Helper to sample frames from a source canvas into downscaled ImageData for GIF export
 */
export function sampleCanvasFrame(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number = 360,
  targetHeight: number = 202
): ImageData | null {
  try {
    const offscreen = document.createElement('canvas');
    offscreen.width = targetWidth;
    offscreen.height = targetHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    return ctx.getImageData(0, 0, targetWidth, targetHeight);
  } catch {
    return null;
  }
}

import pako from 'pako';

export async function decompressGzip(arrayBuffer) {
  // Проверяем поддержку CompressionStream API
  if ('CompressionStream' in window) {
    const stream = new Response(arrayBuffer).body.pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }

  //  pako как fallback
  try {
    const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
    return decompressed;
  } catch (err) {
    throw new Error('Failed to decompress gzip data', err);
  }
}

import pako from 'pako';

// Функция для разархивирования gzip в браузере
export async function decompressGzip(arrayBuffer) {
  // Проверяем поддержку CompressionStream API
  if ('CompressionStream' in window) {
    try {
      const stream = new Response(arrayBuffer).body.pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).text();
    } catch (err) {
      // fallback to pako
    }
  }

  // Используем pako как fallback
  try {
    const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
    return decompressed;
  } catch (err) {
    throw new Error('Failed to decompress gzip data');
  }
}

import { NextRequest } from 'next/server';
import { createReadStream, existsSync, readFileSync, statSync } from 'fs';
import { dirname, isAbsolute, join, relative, resolve } from 'path';
// @ts-ignore
import mime from 'mime';

const findRepoRoot = () => {
  let current = process.cwd();

  for (let i = 0; i < 8; i++) {
    const packageJsonPath = join(current, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

        if (packageJson.name === 'gitroom') {
          return current;
        }
      } catch {
        // Keep walking up if a package.json cannot be parsed.
      }
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return process.cwd();
};

const resolveLocalUploadDirectory = () =>
  process.env.UPLOAD_DIRECTORY || resolve(findRepoRoot(), '.uploads');

async function* nodeStreamToIterator(stream: any) {
  for await (const chunk of stream) {
    yield chunk;
  }
}
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(new Uint8Array(value));
      }
    },
  });
}
export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{
      path?: string[];
    }>;
  }
) => {
  const { path: uploadPath } = await context.params;
  const uploadDirectory = resolveLocalUploadDirectory();
  const filePath = resolve(uploadDirectory, ...(uploadPath ?? []));
  const relativePath = relative(uploadDirectory, filePath);

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    isAbsolute(relativePath)
  ) {
    return new Response('Not found', { status: 404 });
  }

  const response = createReadStream(filePath);
  const fileStats = statSync(filePath);
  const contentType = mime.getType(filePath) || 'application/octet-stream';
  const iterator = nodeStreamToIterator(response);
  const webStream = iteratorToStream(iterator);
  return new Response(webStream, {
    headers: {
      'Content-Type': contentType,
      // Set the appropriate content-type header
      'Content-Length': fileStats.size.toString(),
      // Set the content-length header
      'Last-Modified': fileStats.mtime.toUTCString(),
      // Set the last-modified header
      'Cache-Control': 'public, max-age=31536000, immutable', // Example cache-control header
    },
  });
};

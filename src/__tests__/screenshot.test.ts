import { describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EcpClient } from '@danecodes/roku-ecp';
import { registerTools } from '../mcp/register-tools.js';
import { screenshotMimeType } from '../core/screenshot.js';

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const jpeg = Buffer.from([255, 216, 255, 224, 0]);

describe('screenshot format', () => {
  it.each([[png, 'image/png'], [jpeg, 'image/jpeg']] as const)
    ('detects the image signature', (image, mimeType) => {
      expect(screenshotMimeType(image)).toBe(mimeType);
    });

  it.each([Buffer.alloc(0), Buffer.from('<html>error</html>'), Buffer.from([137, 80])])
    ('rejects unsupported or truncated signatures', image => {
      expect(() => screenshotMimeType(image)).toThrow('not a PNG or JPEG');
    });

  it.each([[png, 'image/png'], [jpeg, 'image/jpeg']] as const)
    ('returns the original bytes with matching MIME through MCP', async (image, mimeType) => {
      let screenshot: ((args: { save_path?: string }) => Promise<{ content: Array<{ type: string; data: string; mimeType: string }> }>) | undefined;
      const server = {
        tool: vi.fn((...args: unknown[]) => {
          if (args[0] === 'roku_screenshot') screenshot = args.at(-1) as typeof screenshot;
        }),
      };
      const client = { takeScreenshot: vi.fn().mockResolvedValue(image) };
      registerTools(server as unknown as McpServer, client as unknown as EcpClient);
      const result = await screenshot!({});
      expect(result.content).toEqual([{ type: 'image', data: image.toString('base64'), mimeType }]);
    });
});

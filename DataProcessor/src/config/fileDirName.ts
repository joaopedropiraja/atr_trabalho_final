import { dirname } from "node:path";
import { fileURLToPath } from "url";

export default function fileDirName(metaUrl: string): {
  __dirname: string;
  __filename: string;
} {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);

  return { __dirname, __filename };
}

import { Buffer } from "buffer";

export function jwtDecode(token: string) {
  const parts = token
    .split(".")
    .map((part) =>
      Buffer.from(
        part.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString()
    );
  return JSON.parse(parts[1]);
}

import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// En production (BLOB_READ_WRITE_TOKEN défini), les fichiers sont stockés sur
// Vercel Blob. En développement local sans ce token, on écrit dans
// public/uploads afin de pouvoir tester tout le flux sans dépendance cloud.
export async function uploadPlanFile(file: File, projectId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${projectId}-${Date.now()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`plans/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadAvatarFile(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `avatar-${userId}-${Date.now()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`avatars/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

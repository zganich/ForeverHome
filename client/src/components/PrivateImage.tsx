import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/api";

export function PrivateImage({
  locator,
  alt,
  className,
}: {
  locator: string;
  alt: string;
  className?: string;
}) {
  const { user } = useFirebaseAuth();
  const [image, setImage] = useState<{
    locator: string;
    uid: string;
    src: string;
  }>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setFailed(false);
    setImage(undefined);
    if (!user) return;
    // Server derives ownership independently; also avoid displaying the wrong
    // local object if a foreign locator happens to reuse an owner's filename.
    const name = locator.split("/").pop() ?? "";
    if (!/^[A-Za-z0-9_-]+\.(?:jpg|png|gif|webp)$/.test(name)) {
      setFailed(true);
      return;
    }
    void (async () => {
      try {
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(user.uid)
        );
        const owner = Array.from(new Uint8Array(digest), byte =>
          byte.toString(16).padStart(2, "0")
        ).join("");
        const url = new URL(locator);
        if (
          url.protocol !== "https:" ||
          url.host !== "storage.googleapis.com" ||
          url.search ||
          url.hash ||
          !url.pathname.endsWith(`/uploads/${owner}/${name}`)
        )
          throw new Error("Invalid photo locator");
        const response = await authFetch(`/api/media/${name}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Photo unavailable");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ locator, uid: user.uid, src: objectUrl });
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    })();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [locator, user?.uid]);
  if (failed) return <p role="status">Photo unavailable. Please try again.</p>;
  if (!image || image.uid !== user?.uid || image.locator !== locator)
    return <p role="status">Loading photo…</p>;
  return <img src={image.src} alt={alt} className={className} />;
}

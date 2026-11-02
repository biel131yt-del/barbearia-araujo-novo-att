"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export default function AppManifest({
  initialAdmin,
}: {
  initialAdmin: boolean;
}) {
  const pathname = usePathname();
  const adminArea = pathname.startsWith("/admin");
  const [allowed, setAllowed] = useState(initialAdmin);
  useEffect(() => {
    if (!adminArea) {
      setAllowed(false);
      return;
    }
    const controller = new AbortController();
    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setAllowed(d.user?.role === "admin"))
      .catch(() => {
        if (!controller.signal.aborted) setAllowed(false);
      });
    return () => controller.abort();
  }, [pathname, adminArea]);
  const admin = adminArea && allowed && pathname !== "/admin/login";
  return (
    <>
      {(!adminArea || admin) && (
        <link
          rel="manifest"
          href={admin ? "/api/admin/manifest" : "/manifest.json"}
          crossOrigin="use-credentials"
        />
      )}
      <meta
        name="apple-mobile-web-app-title"
        content={admin ? "Araújo Admin" : "Araújo"}
      />
    </>
  );
}

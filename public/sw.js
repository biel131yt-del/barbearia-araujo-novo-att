self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: "Abra o aplicativo para ver a atualização." };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Barbearia Araújo", {
      body: data.body || "Você tem uma nova atualização.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.type || "barbearia",
      data: { link: data.link || "/cliente" },
    }),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let url;
  try {
    url = new URL(
      event.notification.data?.link || "/cliente",
      self.location.origin,
    );
    if (url.origin !== self.location.origin)
      url = new URL("/cliente", self.location.origin);
  } catch {
    url = new URL("/cliente", self.location.origin);
  }
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        const client = clients.find(
          (c) => new URL(c.url).origin === self.location.origin,
        );
        if (client) {
          await client.navigate(url.href);
          return client.focus();
        }
        return self.clients.openWindow(url.href);
      }),
  );
});

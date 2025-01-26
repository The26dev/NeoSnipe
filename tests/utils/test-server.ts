import { createServer } from 'http';
import next from 'next';
import { AddressInfo } from 'net';

export async function startTestServer() {
  const app = next({ dev: true });
  await app.prepare();
  
  const handle = app.getRequestHandler();
  const server = createServer((req, res) => {
    return handle(req, res);
  });
  
  await new Promise((resolve) => {
    server.listen(3000, () => {
      resolve(null);
    });
  });
  
  return server;
}

export async function stopTestServer(server) {
  return new Promise((resolve) => {
    server.close(() => {
      resolve(null);
    });
  });
}
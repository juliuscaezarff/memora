import app from "./index";

export default async function handler(req: Request): Promise<Response> {
  return app.fetch(req);
}

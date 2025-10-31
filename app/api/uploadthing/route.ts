import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

/**
 * Next.js API Route Handler for UploadThing
 * Handles GET and POST requests for file uploads
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
    logLevel: "Info",
  },
})

import { httpBatchLink } from "@trpc/client";

import { appRouter } from "@/app/api/trpc/[trpc]/route";

export const serverApi = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: "http://localhost:3003/api/trpc",
    }),
  ],
});

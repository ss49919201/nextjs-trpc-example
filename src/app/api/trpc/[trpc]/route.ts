import {
  initTRPC,
  MiddlewareBuilder,
  MiddlewareFunction,
  TRPCError,
} from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { z } from "zod";

const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

export const appRouter = router({
  greeting1: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query((opts) => {
      return { msg: opts.input.name! };
    }),
  greeting2: publicProcedure
    // Middleware
    .use(async (opts) => {
      console.log(opts.rawInput);
      const result = await opts.next();
      return result;
    })
    .input(z.object({ name: z.string(), date: z.date() }))
    .mutation((opts) => {
      return { msg: `Hello ${opts.input.name ?? "World"}` };
    }),
});

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "api/trpc",
    req: req,
    router: appRouter,
    createContext: () => ({}),
  });
};

const dumpBody = (req: Request) => {
  const clone = req.clone();
  clone
    .json()
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

export { handler as GET, handler as POST };
export type AppRouter = typeof appRouter;

import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { randomBytes } from "crypto";
import { z, ZodError } from "zod";

const t = initTRPC.create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    let parsedMessage: string | undefined;
    try {
      parsedMessage = JSON.parse(error.message);
    } catch {}

    return {
      ...shape,
      data: {
        ...shape.data,
        parsedMessage,
        validationInputError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? {
                rawMessage: error.cause.message,
                parsedMessage: (() => {
                  try {
                    return JSON.parse(error.cause.message);
                  } catch {
                    return undefined;
                  }
                })(),
              }
            : null,
      },
    };
  },
});
const router = t.router;

const errorLogMiddleware = t.middleware(async (opts) => {
  const result = await opts.next();

  const newLineToSpace = (str: string) => str.replace(/\n/g, " ");

  if (!result.ok) {
    console.log(
      "Error:",
      `message: ${newLineToSpace(result.error.message)}`,
      `code: ${newLineToSpace(result.error.code)}`,
      `name: ${newLineToSpace(result.error.name)}`,
      `stack: ${result.error.stack ? newLineToSpace(result.error.stack) : ""}`,
      `cause: ${
        result.error.cause ? newLineToSpace(result.error.cause.message) : ""
      }`
    );
  }

  return result;
});

const requestLogMiddleware = t.middleware(async (opts) => {
  const requestId = randomBytes(8).toString("hex");
  const start = Date.now();
  const result = await opts.next();
  const duration = Date.now() - start;
  let parsedInput = "";
  try {
    parsedInput = JSON.stringify(opts.rawInput);
  } catch (err) {
    parsedInput = "Could not parse input";
  }
  const path = opts.path;
  const type = opts.type;
  console.log(
    `Request ${requestId} ${type} ${path} ${parsedInput} took ${duration}ms`
  );
  return result;
});

const publicProcedure = t.procedure
  .use(requestLogMiddleware)
  .use(errorLogMiddleware);

export const appRouter = router({
  greeting1: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query((opts) => {
      const s = z.string().parse(100);
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

/**
 * The request lifecycle as data: the layers a request passes through in each framework, and the
 * frames of one trip (in through every layer, back out as a response). Rendered in 3D by
 * scene-3d.tsx and as a flat list by the fallback.
 */

export type Framework = "django" | "fastapi" | "flask"
export type Variant = "normal" | "rejected"
export type Layer = { id: string; label: string; detail: string }
export type Frame = {
  /** Index of the layer the packet is at. */
  at: number
  direction: "in" | "out"
  packet: string
  /** "error": the response is an error short-circuited by this layer. */
  tone: "ok" | "error"
  label: string
  narration: string
}

export const STACKS: Record<Framework, Layer[]> = {
  django: [
    { id: "client", label: "Client", detail: "browser, app" },
    { id: "server", label: "gunicorn", detail: "WSGI server" },
    { id: "middleware", label: "Middleware", detail: "MIDDLEWARE" },
    { id: "router", label: "URLconf", detail: "urls.py" },
    { id: "view", label: "View", detail: "views.py" },
    { id: "orm", label: "ORM", detail: "models.py" },
    { id: "db", label: "Database", detail: "PostgreSQL" },
  ],
  fastapi: [
    { id: "client", label: "Client", detail: "browser, app" },
    { id: "server", label: "uvicorn", detail: "ASGI server" },
    { id: "middleware", label: "Middleware", detail: "add_middleware" },
    { id: "router", label: "Router", detail: "APIRouter" },
    { id: "deps", label: "Dependencies", detail: "Depends()" },
    { id: "view", label: "Endpoint", detail: "path function" },
    { id: "db", label: "Database", detail: "SQLAlchemy" },
  ],
  flask: [
    { id: "client", label: "Client", detail: "browser, app" },
    { id: "server", label: "gunicorn", detail: "WSGI server" },
    { id: "middleware", label: "before_request", detail: "hooks" },
    { id: "router", label: "URL map", detail: "@app.route" },
    { id: "view", label: "View", detail: "function" },
    { id: "orm", label: "SQLAlchemy", detail: "models" },
    { id: "db", label: "Database", detail: "PostgreSQL" },
  ],
}

const REQUEST: Record<Framework, string> = {
  django: "GET /orders/7/",
  fastapi: "GET /orders/7",
  flask: "GET /orders/7",
}

/** What each layer does on the way in, per framework (indexes match STACKS). */
const IN_NOTES: Record<Framework, string[]> = {
  django: [
    "The client sends GET /orders/7/ with its session cookie.",
    "gunicorn accepts the connection and turns the raw HTTP into a WSGI call into Django.",
    "Middleware runs top to bottom: security headers, sessions, CSRF, then authentication sets request.user.",
    "The URLconf matches orders/<int:pk>/ and picks order_detail with pk=7.",
    "The view checks permissions and asks the ORM for the order.",
    "The ORM turns Order.objects.get(pk=7) into SQL.",
    "The database runs the query and returns one row.",
  ],
  fastapi: [
    "The client sends GET /orders/7 with a Bearer token.",
    "uvicorn accepts the connection and calls the app through ASGI, on an event loop.",
    "Middleware runs (CORS, timing, request ID) before routing.",
    "The router matches /orders/{order_id} and converts order_id to int.",
    "Dependencies run first: get_db opens a session, get_current_user checks the token.",
    "The endpoint function runs with everything it declared already resolved.",
    "SQLAlchemy runs SELECT … WHERE id = 7 on the database.",
  ],
  flask: [
    "The client sends GET /orders/7 with its session cookie.",
    "gunicorn accepts the connection and calls the Flask app through WSGI.",
    "Flask pushes the app and request contexts, then before_request hooks run (e.g. load the user into g).",
    "The URL map matches /orders/<int:order_id> and picks the view.",
    "The view function runs and asks SQLAlchemy for the order.",
    "SQLAlchemy builds the SELECT for the session's connection.",
    "The database runs the query and returns one row.",
  ],
}

const OUT_NOTES: Record<Framework, string[]> = {
  django: [
    "The browser receives 200 OK with the order as HTML or JSON.",
    "gunicorn writes the response bytes back on the connection.",
    "Middleware runs again in reverse order (bottom to top), e.g. adding headers and saving the session.",
    "",
    "The view wraps the data in an HttpResponse (render() or JsonResponse).",
    "The ORM turns the row into an Order object.",
    "",
  ],
  fastapi: [
    "The client receives 200 OK with JSON.",
    "uvicorn sends the response; the event loop moves on to other requests.",
    "Middleware sees the response on the way out (adds X-Request-ID, timing).",
    "",
    "Dependency cleanup runs (the code after yield closes the DB session).",
    "The return value is validated against response_model and serialised to JSON.",
    "",
  ],
  flask: [
    "The browser receives 200 OK.",
    "gunicorn writes the response back on the connection.",
    "after_request hooks run, then teardown hooks; the contexts are popped.",
    "",
    "The view returns a dict or render_template(); Flask makes a Response.",
    "SQLAlchemy turns the row into an Order object.",
    "",
  ],
}

/** Who answers early when the caller isn't logged in, and with what. */
const REJECT: Record<Framework, { packet: string; why: string }> = {
  django: {
    packet: "302 → /login/",
    why: "Not logged in: LoginRequiredMiddleware (Django 5.1+) redirects to the login page right here. The URLconf, view and database never run.",
  },
  fastapi: {
    packet: "401 Unauthorized",
    why: "No valid token: an auth middleware returns 401 right here. Routing, dependencies, the endpoint and the database never run.",
  },
  flask: {
    packet: "401 Unauthorized",
    why: "A before_request hook that returns a response stops the request: the view and database never run.",
  },
}

/** A full round trip: in through every layer to the database, then back out to the client. */
export function lifecycleFrames(framework: Framework, variant: Variant = "normal"): Frame[] {
  const layers = STACKS[framework]
  const inNotes = IN_NOTES[framework]
  const outNotes = OUT_NOTES[framework]
  const frames: Frame[] = []
  const reject = layers.findIndex((l) => l.id === "middleware")

  for (let i = 0; i < layers.length; i++) {
    if (variant === "rejected" && i === reject) {
      frames.push({
        at: i,
        direction: "in",
        packet: REQUEST[framework],
        tone: "error",
        label: "Rejected",
        narration: REJECT[framework].why,
      })
      for (let j = i - 1; j >= 0; j--) {
        frames.push({
          at: j,
          direction: "out",
          packet: REJECT[framework].packet,
          tone: "error",
          label: j === 0 ? "Error response" : `Back through ${layers[j]!.label}`,
          narration:
            j === 0
              ? "The client gets the error quickly and cheaply: rejecting early is why auth and rate limits live in middleware."
              : "The short-circuited response still travels back through the outer layers.",
        })
      }
      return frames
    }
    frames.push({
      at: i,
      direction: "in",
      packet: REQUEST[framework],
      tone: "ok",
      label: i === 0 ? "Request" : layers[i]!.label,
      narration: inNotes[i]!,
    })
  }
  for (let i = layers.length - 2; i >= 0; i--) {
    const note = outNotes[i]!
    if (!note) continue // layers with nothing to do on the way out are skipped
    frames.push({
      at: i,
      direction: "out",
      packet: i <= 2 ? "200 OK" : "Order #7",
      tone: "ok",
      label: i === 0 ? "Response" : `${layers[i]!.label} (out)`,
      narration: note,
    })
  }
  return frames
}

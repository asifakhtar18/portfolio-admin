import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const methodStyles: Record<Method, string> = {
    GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PUT: "bg-amber-100 text-amber-700 border-amber-200",
    PATCH: "bg-violet-100 text-violet-700 border-violet-200",
    DELETE: "bg-rose-100 text-rose-700 border-rose-200",
}

function MethodBadge({ method }: { method: Method }) {
    return (
        <span
            className={`inline-flex min-w-[3.5rem] justify-center rounded border px-2 py-0.5 font-mono text-xs font-semibold ${methodStyles[method]}`}
        >
            {method}
        </span>
    )
}

function AuthBadge({ level }: { level: "public" | "auth" | "store" }) {
    if (level === "public") {
        return <Badge variant="secondary">Public</Badge>
    }
    if (level === "auth") {
        return <Badge variant="outline">Auth</Badge>
    }
    return <Badge variant="outline">Auth + Storage</Badge>
}

function Code({ children }: { children: React.ReactNode }) {
    return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            {children}
        </code>
    )
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">{children}</code>
        </pre>
    )
}

function Endpoint({
    method,
    path,
    auth,
    children,
}: {
    method: Method
    path: string
    auth: "public" | "auth" | "store"
    children?: React.ReactNode
}) {
    return (
        <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center gap-3">
                <MethodBadge method={method} />
                <span className="font-mono text-sm break-all">{path}</span>
                <span className="ml-auto">
                    <AuthBadge level={auth} />
                </span>
            </div>
            {children ? <div className="mt-3 space-y-3 text-sm text-muted-foreground">{children}</div> : null}
        </div>
    )
}

export default function ApiDocsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Docs</h1>
                <p className="text-muted-foreground">
                    How to read and write your portfolio data through the Folyo API. Your content and images live in
                    your own storage — the API is the only way clients access them.
                </p>
            </div>

            {/* Getting started */}
            <Card>
                <CardHeader>
                    <CardTitle>Getting started</CardTitle>
                    <CardDescription>Authenticate, configure storage, then read or write your data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>
                            Register or log in to receive a <strong>JWT</strong>. Send it on every protected request as{" "}
                            <Code>Authorization: Bearer &lt;token&gt;</Code>.
                        </li>
                        <li>
                            Your <strong>tenant id</strong> is returned by <Code>GET /auth/me</Code>. It also identifies
                            your public portfolio in <Code>/public/:tenantId/*</Code> routes.
                        </li>
                        <li>
                            Configure your own storage with <Code>PUT /credentials</Code> before using any content
                            endpoint. Until then those endpoints return a configuration error.
                        </li>
                    </ol>
                    <div>
                        <p className="mb-2 font-medium text-foreground">Base URL (local dev)</p>
                        <CodeBlock>http://localhost:4000</CodeBlock>
                    </div>
                </CardContent>
            </Card>

            {/* Conventions */}
            <Card>
                <CardHeader>
                    <CardTitle>Conventions</CardTitle>
                    <CardDescription>What every response looks like.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Bodies are JSON, except image uploads which use <Code>multipart/form-data</Code>.</li>
                        <li>Every stored <Code>_id</Code> is returned as a string <Code>id</Code>.</li>
                        <li>Dates are ISO-8601 UTC strings (e.g. <Code>2026-10-02T12:34:56.789Z</Code>).</li>
                        <li>
                            Canonical field names are stable: <Code>isApproved</Code>, <Code>createdAt</Code>,{" "}
                            <Code>images</Code>.
                        </li>
                        <li>
                            Empty singleton reads return 200 with an empty state (About/Contact →{" "}
                            <Code>null</Code>, Skills → <Code>{`{ "items": [] }`}</Code>), not a 404.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Errors */}
            <Card>
                <CardHeader>
                    <CardTitle>Error format</CardTitle>
                    <CardDescription>
                        All errors return <Code>{`{ "error": "<message>" }`}</Code> with a status code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-4 font-medium">Status</th>
                                    <th className="py-2 pr-4 font-medium">Meaning</th>
                                    <th className="py-2 font-medium">Typical cause</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    ["400", "Validation", "Missing/blank field, invalid email, non-image upload"],
                                    ["400", "Configuration", "Content op before storage configured, or invalid credentials"],
                                    ["401", "Authentication", "Absent/malformed/expired token, or bad login"],
                                    ["404", "Not found", "Unknown or invalid resource id"],
                                    ["409", "Conflict", "Duplicate email or username on register"],
                                    ["429", "Rate limited", "More than 5 public submissions per 15 min"],
                                    ["502", "Storage upstream", "Blob delete failed — record left intact"],
                                    ["500", "Unexpected", "Generic message only; internals never surfaced"],
                                ].map(([status, meaning, cause]) => (
                                    <tr key={`${status}-${meaning}`}>
                                        <td className="py-2 pr-4 font-mono">{status}</td>
                                        <td className="py-2 pr-4">{meaning}</td>
                                        <td className="py-2 text-muted-foreground">{cause}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Auth & account */}
            <Card>
                <CardHeader>
                    <CardTitle>Auth &amp; account</CardTitle>
                    <CardDescription>Register, log in, read your profile, configure storage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Endpoint method="POST" path="/auth/register" auth="public">
                        <p>Create a tenant and get a token.</p>
                        <CodeBlock>{`{ "email": "you@example.com", "username": "you", "password": "min 8 chars" }`}</CodeBlock>
                        <p>201 → <Code>{`{ "token": "<jwt>" }`}</Code>. 409 if email/username taken.</p>
                    </Endpoint>
                    <Endpoint method="POST" path="/auth/login" auth="public">
                        <CodeBlock>{`{ "email": "you@example.com", "password": "..." }`}</CodeBlock>
                        <p>200 → <Code>{`{ "token": "<jwt>" }`}</Code>. 401 on any mismatch.</p>
                    </Endpoint>
                    <Endpoint method="GET" path="/auth/me" auth="auth">
                        <CodeBlock>{`{ "id": "6abed307...", "email": "you@example.com", "username": "you", "storageConfigured": true }`}</CodeBlock>
                        <p>Never returns the password hash or credentials. Use <Code>id</Code> as your public tenant id.</p>
                    </Endpoint>
                    <Endpoint method="PUT" path="/credentials" auth="auth">
                        <p>Validates and encrypts your storage credentials before storing them.</p>
                        <CodeBlock>{`{ "mongoUri": "mongodb+srv://...", "blobToken": "vercel_blob_rw_..." }`}</CodeBlock>
                        <p>200 → <Code>{`{ "storageConfigured": true }`}</Code>. Credentials are never echoed back.</p>
                    </Endpoint>
                </CardContent>
            </Card>

            {/* Owner content */}
            <Card>
                <CardHeader>
                    <CardTitle>Your content</CardTitle>
                    <CardDescription>
                        Operates on your own store. Requires auth and configured storage. Every mutation also writes an
                        activity entry visible in <Code>GET /updates</Code>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Endpoint method="GET" path="/about" auth="store">
                        <p>Your About singleton, or <Code>null</Code>.</p>
                        <CodeBlock>{`{ "id": "...", "bio": "...", "designation": "...", "profileImage": "https://...", "updatedAt": "ISO" }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="PUT" path="/about" auth="store">
                        <p>
                            Upsert. JSON <Code>{`{ bio, designation, profileImage? }`}</Code>, or{" "}
                            <Code>multipart/form-data</Code> with a <Code>profileImage</Code> file.
                        </p>
                    </Endpoint>
                    <Endpoint method="GET" path="/skills" auth="store">
                        <CodeBlock>{`{ "id": "...", "items": ["TypeScript", "Go"], "updatedAt": "ISO" }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="PUT" path="/skills" auth="store">
                        <p>Body <Code>{`{ "items": ["TypeScript", "Go"] }`}</Code> (array of non-empty strings).</p>
                    </Endpoint>
                    <Endpoint method="GET" path="/projects" auth="store">
                        <p>Your projects, ordered by <Code>createdAt</Code> desc.</p>
                        <CodeBlock>{`{
  "id": "...", "name": "...", "description": "...",
  "technologies": ["..."],
  "images": [{ "id": "uuid", "url": "https://...", "alt": "", "isMain": true }],
  "link": "...", "sourceCode": "...", "featured": false,
  "createdAt": "ISO", "updatedAt": "ISO"
}`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="POST" path="/projects" auth="store">
                        <CodeBlock>{`{ "name": "...", "description": "...", "technologies": ["..."], "link?": "...", "sourceCode?": "...", "featured?": false }`}</CodeBlock>
                        <p>Starts with an empty <Code>images</Code> array.</p>
                    </Endpoint>
                    <Endpoint method="PUT" path="/projects/:id" auth="store">
                        <p>Partial update of the fields above. 404 on unknown id.</p>
                    </Endpoint>
                    <Endpoint method="POST" path="/projects/:id/images" auth="store">
                        <p>
                            <Code>multipart/form-data</Code> with one or more files under field <Code>images</Code>.
                            Uploaded in order; first becomes main when none exist.
                        </p>
                    </Endpoint>
                    <Endpoint method="DELETE" path="/projects/:id" auth="store">
                        <p>Deletes blobs first, then the record. 204 · 502 if a blob delete fails (record kept) · 404.</p>
                    </Endpoint>
                    <Endpoint method="GET" path="/experiences" auth="store">
                        <CodeBlock>{`{ "id": "...", "title": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "...", "technologies?": ["..."], "imageUrl?": "https://...", "createdAt": "ISO", "updatedAt": "ISO" }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="POST" path="/experiences" auth="store">
                        <p>Required: <Code>title, company, startDate, endDate, description</Code>. Optional: <Code>technologies[], imageUrl</Code>.</p>
                    </Endpoint>
                    <Endpoint method="PUT" path="/experiences/:id" auth="store" />
                    <Endpoint method="DELETE" path="/experiences/:id" auth="store" />
                    <Endpoint method="GET" path="/contact-info" auth="store">
                        <p>Your contact singleton, or <Code>null</Code>.</p>
                    </Endpoint>
                    <Endpoint method="PUT" path="/contact-info" auth="store">
                        <CodeBlock>{`{ "email": "...", "phone": "...", "socialMedia?": [{ "platform": "...", "url": "..." }] }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="GET" path="/testimonials" auth="store">
                        <p>ALL your testimonials (any approval state), <Code>createdAt</Code> desc.</p>
                        <CodeBlock>{`{ "id": "...", "name": "...", "role": "...", "company": "...", "message": "...", "avatar?": "https://...", "rating?": 5, "linkedin?": "...", "twitter?": "...", "isApproved": false, "createdAt": "ISO" }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="PATCH" path="/testimonials/:id/approve" auth="store">
                        <p>Sets <Code>isApproved: true</Code>.</p>
                    </Endpoint>
                    <Endpoint method="DELETE" path="/testimonials/:id" auth="store">
                        <p>Deletes the avatar blob first, then the record.</p>
                    </Endpoint>
                    <Endpoint method="GET" path="/messages" auth="store">
                        <p>Contact messages, <Code>createdAt</Code> desc.</p>
                        <CodeBlock>{`{ "id": "...", "name": "...", "email": "...", "message": "...", "createdAt": "ISO" }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="GET" path="/stats" auth="store">
                        <CodeBlock>{`{ "projects": 3, "skills": 12, "experiences": 4 }`}</CodeBlock>
                    </Endpoint>
                    <Endpoint method="GET" path="/updates" auth="store">
                        <p>Up to 5 most recent activity entries, <Code>updatedAt</Code> desc.</p>
                        <CodeBlock>{`[{ "id": "...", "section": "projects", "title": "...", "updatedAt": "ISO" }]`}</CodeBlock>
                    </Endpoint>
                </CardContent>
            </Card>

            {/* Public */}
            <Card>
                <CardHeader>
                    <CardTitle>Public endpoints</CardTitle>
                    <CardDescription>
                        No auth. <Code>:tenantId</Code> is your tenant id — this is what your public site reads.
                        Submissions are rate-limited (5 per 15 min per client).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Endpoint method="GET" path="/public/:tenantId/about" auth="public" />
                    <Endpoint method="GET" path="/public/:tenantId/skills" auth="public" />
                    <Endpoint method="GET" path="/public/:tenantId/contact" auth="public" />
                    <Endpoint method="GET" path="/public/:tenantId/projects" auth="public" />
                    <Endpoint method="GET" path="/public/:tenantId/experiences" auth="public" />
                    <Endpoint method="GET" path="/public/:tenantId/testimonials" auth="public">
                        <p>Approved testimonials only.</p>
                    </Endpoint>
                    <Endpoint method="POST" path="/public/:tenantId/testimonials" auth="public">
                        <p>
                            Stored with <Code>isApproved: false</Code>. Required: <Code>name, role, company, message</Code>.
                            Optional: <Code>rating, linkedin, twitter</Code>, and an <Code>avatar</Code> image file (send
                            as <Code>multipart/form-data</Code>). The message is HTML-sanitized.
                        </p>
                    </Endpoint>
                    <Endpoint method="POST" path="/public/:tenantId/messages" auth="public">
                        <p>
                            JSON <Code>{`{ name, email, message }`}</Code>. Email is validated; message is HTML-sanitized.
                        </p>
                    </Endpoint>
                </CardContent>
            </Card>

            {/* Example */}
            <Card>
                <CardHeader>
                    <CardTitle>End-to-end example</CardTitle>
                    <CardDescription>Register, configure storage, write content, read it publicly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock>{`BASE=http://localhost:4000

# 1. Register (or login) to get a token
TOKEN=$(curl -s -X POST $BASE/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","username":"you","password":"password123"}' \\
  | sed -E 's/.*"token":"([^"]+)".*/\\1/')

# 2. Find your tenant id (use it as OPERATOR_TENANT_ID in the public site)
curl -s $BASE/auth/me -H "Authorization: Bearer $TOKEN"

# 3. Configure your own storage (required before content ops)
curl -s -X PUT $BASE/credentials -H "Authorization: Bearer $TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{"mongoUri":"mongodb+srv://...","blobToken":"vercel_blob_rw_..."}'

# 4. Write content
curl -s -X PUT $BASE/about -H "Authorization: Bearer $TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{"bio":"Builder of things","designation":"Software Engineer"}'

# 5. Public read (what the public site does)
TENANT_ID=... # from step 2
curl -s $BASE/public/$TENANT_ID/about`}</CodeBlock>
                </CardContent>
            </Card>
        </div>
    )
}

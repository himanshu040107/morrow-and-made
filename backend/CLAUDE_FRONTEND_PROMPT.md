# Claude prompt: build a frontend for this project

You are working with me to build a frontend that integrates with an existing Express and MongoDB backend. First inspect the repository and its conventions; then implement the frontend in the existing project if a frontend already exists. If this repository is backend-only, create a clearly separated frontend (for example, `client/`) and explain the chosen stack before making large structural changes. Do not rewrite the backend as part of frontend work. Keep API integration centralized, use environment configuration for the API base URL, and never put server secrets in browser code.

## What this project is

This is a small product marketplace API. Users can register, log in, fetch their profile, refresh tokens, and log out. Authenticated sellers can create, update, and delete products. Anyone can list products; an authenticated user can fetch a product detail. The backend does not currently expose an endpoint to promote a normal user to seller, so do not invent seller signup or role-management API behavior. Show seller-only actions only when the signed-in user's role is `seller`.

The repository currently contains an Express backend, not an established frontend. Its source layout is:

```text
src/
  app/app.js                     Express app and API mounts
  server.js                      Connects MongoDB and listens on port 3000
  config/config.js               Reads server-only environment values
  config/db.js                   MongoDB connection
  config/imageKit.js             Server-side ImageKit client
  controllers/auth.controller.js Auth endpoints
  controllers/product.controller.js Product endpoints
  middleware/authenticate.js     Access-token authentication
  middleware/verifySeller.js     Seller role check
  models/user.model.js           User model
  models/Product.model.js        Product model
  models/blacklist.model.js      Blacklisted access tokens
  multer.js                      In-memory multipart upload handling
  routes/app.routes.js           /api/auth routes
  routes/product.routes.js       /api/products routes
  validators/auth.validator.js   Auth request validation
  validators/product.validator.js Product request validation
```

Backend dependencies include Express 5, Mongoose, `express-validator`, JWT, bcrypt, cookie-parser, Multer, and ImageKit. The backend listens on port `3000`. Configure the frontend API URL through an environment variable (for example `VITE_API_BASE_URL=http://localhost:3000` if using Vite). Do not assume the deployed URL.

## API contract

All routes below are mounted at the backend origin. JSON responses and request bodies are used except product image uploads, which must use `multipart/form-data`.

### Authentication: `/api/auth`

| Method and path | Auth | Request | Successful response |
|---|---|---|---|
| `POST /register` | No | JSON `{ name, email, password, confirmPassword }`. Name/email/password are required; password minimum is 6 chars. Controller checks that password and confirmPassword match. | `201 { message, data: { accessToken } }`; also sets an HTTP-only `refreshToken` cookie. Note: this response does not include the user or role. |
| `POST /login` | No | JSON `{ email, password }` | `200 { message, data: { userId, name, email }, accessToken }`; also sets an HTTP-only `refreshToken` cookie. Role is not included. |
| `GET /me` | Bearer access token | No body | `200 { message, data: user }`. User data omits passwordHash and refreshToken; model includes `_id`, `name`, `email`, and `role` (`user` or `seller`). |
| `POST /refresh-token` | **Currently requires a valid Bearer access token and refreshToken cookie** | Validator expects JSON `{ refreshToken }`, but controller reads the cookie instead. | `200 { message, accessToken }`; rotates refresh cookie. |
| `POST /logout` | No route-level auth middleware; controller uses refresh cookie and optional Bearer access token | Validator expects JSON `{ refreshToken }`, but controller reads the cookie. | `200 { message }`; clears refresh cookie and blacklists the supplied Bearer access token when present. |

Auth implementation notes that affect the frontend:

- Send the access token as `Authorization: Bearer <token>` on protected requests. Keep it in app memory where practical; do not expose refresh tokens to JavaScript because they are intended to be HTTP-only cookies.
- Use `credentials: "include"` (or Axios `withCredentials: true`) for auth calls that set/read cookies, especially login, register, refresh, and logout. Browser cookie behavior also depends on backend CORS and cookie settings; CORS is not configured in the inspected backend.
- The backend sets cookies with `secure: true`; this may prevent cookies from working over plain local HTTP. Surface a clear configuration/integration note if local cookie auth fails; do not silently pretend refresh/logout worked.
- Current login and registration handlers set the refresh cookie before validating the login password in the login path. The frontend should still display unsuccessful login responses normally and must not treat a failed response as signed in.
- Login returns `accessToken` at the top level; registration returns it at `data.accessToken`. Normalize these two response shapes in one auth API helper.
- After registration, fetch `/api/auth/me` with the access token to obtain canonical profile and role information. Do the same after login because login response does not include `role`.
- Access tokens expire after 15 minutes; refresh tokens after 7 days. The refresh endpoint currently has a problematic access-token requirement, so handle refresh failures by clearing local auth state and returning the user to login rather than looping.
- Logout should send the access token in the Bearer header when available and include cookies. Clear client auth state after the request even if the network call fails.
- Authentication middleware expects an Authorization header. Treat 401 as an expired/invalid session and handle it centrally without creating infinite retries.

### Products: `/api/products`

| Method and path | Auth/role | Request | Successful response |
|---|---|---|---|
| `GET /` | Public | Intended query params may include `page` and `limit`, but current validator checks the request **body**, and controller currently ignores pagination. | `200 { products: Product[] }`, with each seller populated to `{ _id, name, email }`. |
| `GET /:id` | Bearer access token | ID in path | `200 { product: Product }`, seller populated to `{ _id, name, email }`. |
| `POST /` | Bearer token + seller role | `multipart/form-data`: `productName`, `productDescription`, `productPrice`, `stock`, and file field `productImage`. All text fields required; image is effectively required by controller. | `201 { message, product }`. |
| `PUT /:id` | Bearer token + seller role; must own product | `multipart/form-data` fields are optional: `productName`, `productDescription`, `productPrice`, `stock`; optional image field `productImage` replaces image. | `200 { message, product }`. |
| `DELETE /:id` | Bearer token + seller role; must own product | ID in path | `200 { message }`. |

A product object has this shape:

```json
{
  "_id": "MongoDB ObjectId string",
  "productName": "string",
  "productDescription": "string",
  "productPrice": 0,
  "productImage": "https://...",
  "stock": 0,
  "seller": {
    "_id": "MongoDB ObjectId string",
    "name": "string",
    "email": "string"
  }
}
```

For product creation/update, construct `FormData` and append the image with the exact key `productImage`. Do not manually set the multipart `Content-Type`; let the browser set the boundary. Convert numeric form fields to sensible numeric strings/numbers and show validation errors. Render `productImage` as the image URL returned by the server. `productPrice` is numeric and `stock` is numeric; validate nonnegative values in the UI as a usability safeguard, though the backend validators only require numeric values.

### Known backend inconsistencies: build around the observed behavior

These are real integration constraints in the current code. Do not claim the backend supports behavior it does not currently support. Isolate workarounds in the API layer and document which backend fixes would improve integration:

1. `GET /api/products` validator uses `body("page")` and `body("limit")`, despite these normally being query parameters, and the controller returns every product without pagination. Fetch the list without relying on pagination and handle the full array.
2. `GET /api/products/:id` has a validator that checks `body("id")` rather than `params.id`. Send no required request body for this GET; if the API rejects it, report this as a backend validation bug instead of inventing a body requirement.
3. `DELETE /api/products/:id` similarly validates `body("id")` rather than the path parameter. The controller uses `req.params.id`. Try the natural DELETE URL; if it gets a validation error, expose the backend issue clearly. Do not send a fake JSON body by default for DELETE.
4. Refresh-token route requires a valid access token, even though refresh should normally be usable after access-token expiry. Its validator checks a body token, but its controller reads the HTTP-only cookie. Include credentials and the validator-required field only if needed to get through current validation; never read or store the refresh cookie in frontend JavaScript. A refresh request after access expiry may still fail due to middleware.
5. Logout validator requires a JSON `refreshToken` body even though controller uses the cookie. Include a placeholder only if the current validation blocks logout; never put the actual refresh token in frontend code. Cookie/CORS behavior must be configured by backend for cross-origin deployments.
6. `verifySeller` and `authenticate` have slightly different header checks. Always send the standard `Bearer <accessToken>` format.
7. Product create controller's catch block only logs errors and does not send an HTTP response. Add client-side request timeouts/error handling and explain a stalled create as a backend error; do not assume success unless a success response arrives.
8. User role defaults to `user`; there is no seller registration, role update, cart, checkout, order, category, search, review, or payment API in the inspected backend. Do not implement these as working server features. You may add a clearly labeled future-facing UI only if useful, with no fake API integration.

## Frontend behavior to implement

Create a polished, responsive product marketplace frontend with:

- A product listing/home page showing image, name, price, stock availability, and seller name when present.
- Product detail page using `GET /api/products/:id`; include loading, not-found, and API-error states.
- Register, login, and logout flows using the actual request and response shapes above.
- Auth state that stores the access token and profile, fetches `/me`, and refreshes or returns to login on auth failure. Never expose password hashes or cookies.
- Seller tools for signed-in users whose `/me` role is `seller`: create product, edit owned products, and delete owned products. The backend itself enforces ownership, so handle 403 responses gracefully. Since list results include seller IDs, compare `product.seller._id` with the current user ID before showing edit/delete controls; still rely on server authorization.
- Product forms with image preview, required fields for create, optional fields for update, pending/success/error states, and confirmation before deletion.
- Useful empty, loading, validation, unauthorized, forbidden, and server-error states. Parse backend `{ message }` and `{ errors: [...] }` responses; present readable field-specific errors when possible.
- Responsive accessible layout, semantic HTML, keyboard-operable controls, labels, and alt text.

## Implementation expectations

- Inspect the current repository before choosing the frontend stack. Keep backend files intact unless a minimal backend change is essential and explicitly explain it.
- Centralize endpoint paths, base URL, JSON/multipart helpers, Bearer headers, cookie credentials, response parsing, and error normalization in a small API layer.
- Keep secrets out of the frontend. The only frontend config should be public values such as API base URL.
- Use environment examples with placeholders only; do not read or copy server `.env` secrets.
- Do not hardcode fabricated products or pretend actions succeeded. A small visual loading skeleton is fine, but live data must come from the API.
- Do not add tests unless requested. At the end, summarize files created, how to run the frontend, required environment variables, and any backend issues that prevent full integration.

## Suggested build sequence

1. Inspect existing files and determine whether a frontend scaffold already exists.
2. Build shared API and auth state around the actual endpoints and cookie behavior.
3. Implement listing and detail views from real product responses.
4. Implement auth screens and seller forms with multipart uploads.
5. Add responsive styling and all loading/empty/error states.
6. Review every frontend request against the API table and list any backend fixes still needed.

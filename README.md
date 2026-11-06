# Morrow & Made

A full-stack product marketplace built with **React, Node.js, Express.js, and MongoDB**. The platform allows users to create accounts, browse products, and view product details, while sellers can manage their own product listings and upload product images using ImageKit.

## ✨ Features

- **User Authentication:** Secure registration and login with access and refresh tokens.
- **Product Browsing:** Browse available products and view individual product details.
- **Seller Dashboard:** Sellers can create, update, and delete their own products.
- **Image Uploads:** Product images are uploaded and managed using ImageKit.
- **Role-Based Authorization:** Separate permissions for regular users and sellers.
- **RESTful API:** Backend APIs built with Express.js.
- **Responsive Frontend:** React application powered by Vite.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HTTP-only Cookies |
| Image Storage | ImageKit |
| API Communication | REST API |

## 📁 Project Structure

```text
morrow-and-made/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── .env
│   └── package.json
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)
- [ImageKit](https://imagekit.io/) account

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/morrow-and-made.git
```

```bash
cd morrow-and-made
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and add the following environment variables:

```env
MONGO_URI=mongodb://localhost:27017/CRUD

ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

IMAGE_KIT_PUBLIC_KEY=your-imagekit-public-key
IMAGE_KIT_PRIVATE_KEY=your-imagekit-private-key
IMAGE_KIT_URL_ENDPOINT=your-imagekit-url-endpoint

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm start
```

The backend runs locally on:

```text
http://localhost:3000
```

The server uses the `PORT` environment variable when deployed.

### 3. Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

### 4. Frontend Environment Configuration

The frontend API base URL defaults to:

- Development: `http://localhost:3000/api`
- Production: `https://morrow-and-made.onrender.com/api`

To override the API URL, create a `.env` file inside the `client` directory:

```env
VITE_API_URL=https://your-backend-url/api
```

Make sure the URL ends with `/api`.

## 🚀 Deployment (Render)

The application can be deployed on Render using separate backend and frontend services.

### Backend Deployment

Create a new **Web Service** with the following configuration:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Add the following environment variables in the Render dashboard:

- `MONGO_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `IMAGE_KIT_PUBLIC_KEY`
- `IMAGE_KIT_PRIVATE_KEY`
- `IMAGE_KIT_URL_ENDPOINT`
- `FRONTEND_URL`

Use a hosted MongoDB connection string, such as one from MongoDB Atlas. A local `localhost` database URL will not work on Render.

### Frontend Deployment

Create a new **Static Site** with the following configuration:

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Set the following environment variable:

```env
VITE_API_URL=https://your-backend-url/api
```

Replace the URL with your deployed backend URL.

**Important:** Set `FRONTEND_URL` in the backend environment variables to your deployed frontend origin (without a trailing slash). Multiple origins can be separated using commas.

## 📡 API Documentation

All API endpoints are prefixed with `/api`.

### Authentication APIs

Base URL: `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new account | Public |
| POST | `/login` | Authenticate a user | Public |
| GET | `/me` | Get authenticated user details | Authenticated |
| POST | `/refresh-token` | Generate a new access token | Cookie required |
| POST | `/logout` | Log out the user | Cookie required |

**Registration request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "seller"
}
```

The `role` field is optional and accepts `user` or `seller`. New accounts default to `user`.

**Authentication:**

Protected endpoints require an access token in the Authorization header:

```http
Authorization: Bearer <access-token>
```

Login and registration return an access token and set an HTTP-only refresh-token cookie.

### Product APIs

Base URL: `/api/products`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Retrieve all products | Public |
| GET | `/:id` | Retrieve a product by ID | Public |
| POST | `/` | Create a new product | Seller |
| PUT | `/:id` | Update an existing product | Product owner |
| DELETE | `/:id` | Delete a product | Product owner |

**Create Product Request:**

Uses `multipart/form-data` with the following fields:

| Field | Description |
|---|---|
| `productName` | Product name |
| `productDescription` | Product description |
| `productPrice` | Product price |
| `stock` | Available stock |
| `productImage` | Product image file |

The image upload field must be named `productImage`.

**Note:** Product creation, updates, and deletion require seller authorization. Sellers can only manage their own products.

## 🔐 Security & Environment Variables

- Never commit `.env` files or expose secret keys.
- Keep database credentials and JWT secrets in environment variables.
- Refresh tokens are stored in HTTP-only cookies and cannot be accessed through frontend JavaScript.
- Enable credentials in frontend requests that require cookies.
- Let the browser automatically set the multipart content type and boundary when submitting `FormData`.

## 📌 Additional Notes

- The backend requires an active MongoDB connection before accepting requests.
- Product listing currently returns the full product list; `page` and `limit` query parameters are optional.
- Seller-only operations require both seller authorization and product ownership for updates and deletions.

---

**Morrow & Made** — A full-stack marketplace connecting users and sellers.

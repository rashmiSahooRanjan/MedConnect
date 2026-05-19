# MedConnect — Patient ↔ Doctor Portal

A full-stack MERN-style portal that connects patients and doctors with:
- Patient/Doctor authentication (JWT-based)
- Bookings/appointments & payment-gated communication
- Real-time chat + unread counts
- Doctor marking consultations as complete
- WebRTC voice/video calling via Socket.IO signaling
- Disease detection ML service (Python) integrated with the backend
- Prescription & lab report workflows

---

## Project Structure

- **client/** — React (Vite)
- **server/** — Node.js + Express + Socket.IO + MongoDB
- **disease detection/** — Python ML service for disease detection

---

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Python 3 (for disease detection service)
- npm (for both client and server)

---

## Environment Setup

### 1) Server environment variables

Create a file at:

- **server/.env**

Required variables (add more if your controllers need them):

```env
# Server
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=your_jwt_secret

# Stripe (test keys used during development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# (Optional) Razorpay keys if your payment flow uses Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

> Notes:
> - The server logs whether keys exist.
> - Stripe payment controllers expect the above keys.

### 2) Python ML service requirements

The backend starts the ML service automatically and also expects Python dependencies from:

- **disease detection/requirements.txt**

---

## Install & Run

### Option A: Run all services locally (recommended)

#### 1) Start the server

From the repo root:

```bash
cd server
npm install
npm start
```

- API runs at: `http://localhost:5000`
- Socket.IO is attached to the same server
- Static uploads are served under: `http://localhost:5000/uploads/...`
- Python ML service is spawned on port `5001`

#### 2) Start the client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

- React runs at: `http://localhost:5173`

---

## API Overview (Key Endpoints)

### Health Check
- `GET /api/health`

### Communication (Chat + Conversations + Complete)
Base: `/api/communication`

- `POST /api/communication/message`
- `GET /api/communication/appointment/:appointmentId`
- `GET /api/communication/conversations`
- `POST /api/communication/complete/:appointmentId`
- `GET /api/communication/unread`

**Important:** Communication is restricted to **confirmed + paid** appointments.

### Auth
JWT Bearer auth is used via `Authorization: Bearer <token>`.
The server’s `protect` middleware attaches either `req.doctor` or `req.patient`.

---

## Real-time Features

### 1) Chat
- Messages are saved to MongoDB.
- Patient/Doctor UIs fetch conversations and messages.
- Socket.IO events are used best-effort for realtime updates.

### 2) WebRTC Voice/Video Call
Socket.IO signaling events include:
- `call-user`
- `incoming-call`
- `accept-call`
- `call-accepted`
- `reject-call`
- `call-rejected`
- `end-call`
- `ice-candidate`
- `sdp-offer` / `sdp-answer`

---

## Disease Detection (Python ML Service)

The backend spawns the Python service:
- Working directory: `disease detection/`
- Entry file: `app.py`
- Port: `5001`

Install Python deps:

```bash
cd "disease detection"
pip install -r requirements.txt
```

---

## How to Use

1. Register/sign in as **Patient** or **Doctor**.
2. Book an appointment and complete **payment**.
3. Once the appointment becomes **confirmed/paid**, conversations become available.
4. Use Communication UI to:
   - Send chat messages
   - Start voice/video calls
   - Mark consultation complete (doctor)

---

## Troubleshooting

### “Server connection failed” / fetch errors
- Ensure ports match:
  - Client: `5173`
  - Server: `5000`
- Ensure `Authorization: Bearer <token>` is sent.
- Ensure communication is restricted to confirmed + paid appointments.

### Socket.IO realtime not updating
- Confirm the client registers:
  - patient/doctor emits `register` with their user id
- Check browser console for socket event names.

### Python ML service issues
- Ensure `python` / `python3` works in your PATH.
- Check server console logs prefixed with `[Python ML]`.

---

## Development Notes

- Client and server use CORS settings for local development.
- Communication endpoints rely on the `protect` middleware and MongoDB state.
- The ML service is managed by the server process (auto-restart on exit).

---

## License

Add your project license here (or leave default if not specified).


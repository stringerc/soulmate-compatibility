# Soulmate Compatibility Web Application

Full-stack web application for calculating romantic compatibility using 32-dimensional trait analysis.

## Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (deployed on Vercel)
- **Backend**: FastAPI (deployed on Render)
- **Domain**: soulmate.syncscript.app

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Visit http://localhost:8000

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set root directory to `web_app/frontend`
3. Deploy automatically on push

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set root directory to `web_app/backend`
4. Use `render.yaml` for configuration

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://soulmate-api.onrender.com
```

### Backend
```
PORT=8000
```

## Features

- 32-question compatibility questionnaire
- Real-time compatibility calculation
- Dimension-specific breakdowns
- Numerology and astrology compatibility (optional)
- Shareable results
- Responsive design

## License

MIT


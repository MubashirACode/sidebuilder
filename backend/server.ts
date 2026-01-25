import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoute.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';

const app = express();
const port = 3000;

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(','),
  credentials: true, // ✅ FIXED
};

app.use(cors(corsOptions));


app.options('{*any}', cors(corsOptions)); // ✅ REQUIRED for preflight

app.use(express.json({ limit: '50mb' }))
app.post('/api/stripe', express.raw({type:'application/json'}),  stripeWebhook)

app.all('/api/auth/{*any}', toNodeHandler(auth)); // ✅ FIXED wildcard

app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live!');
});


app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

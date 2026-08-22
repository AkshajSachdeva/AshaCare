import 'dotenv/config'; import { app } from './app.js'; import { connectDatabase } from './config/db.js'; import { seedDatabase } from './seed.js';
const port=Number(process.env.PORT||5000);try{const db=await connectDatabase();await seedDatabase();app.listen(port,()=>console.log(`AshaCare API http://localhost:${port} | MongoDB ${db.mode} ${db.host}/${db.name}`))}catch(e){console.error('Startup failed:',e);process.exit(1)}


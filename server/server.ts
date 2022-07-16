import { opine, json } from './deps.ts';

// Start Server
const server = opine();
server.use(json());

// Landing Page
server.get('/', (_, res) => {
  res.send('Landing Page');
});

//Import routes
import RoomRoutes from './routes/room.routes.ts';

// Use routes
server.use('/api/v1', RoomRoutes);

server.listen(3000, () => console.log('server started on port 3000'));

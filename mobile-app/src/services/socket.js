import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/Constants';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'], // Faster for medical real-time data
});

export default socket;

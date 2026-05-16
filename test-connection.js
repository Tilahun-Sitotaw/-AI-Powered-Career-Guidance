const net = require('net');
const dns = require('dns').promises;

async function testConnection() {
  console.log('Testing MongoDB Atlas connectivity...\n');

  // Test DNS
  console.log('1. Testing DNS resolution for hackx.dvb4twj.mongodb.net');
  try {
    const ips = await dns.resolve4('hackx.dvb4twj.mongodb.net');
    console.log('   ✅ DNS resolved to:', ips);
  } catch (err) {
    console.log('   ❌ DNS failed:', err.message);
    console.log('   This means your ISP/network is blocking MongoDB Atlas');
    return;
  }

  // Test TCP connection
  console.log('\n2. Testing TCP connection to MongoDB Atlas (port 27017)');
  const socket = net.createConnection({
    host: 'hackx.dvb4twj.mongodb.net',
    port: 27017,
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log('   ✅ TCP connection successful!');
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log('   ❌ TCP connection failed:', err.message);
    console.log('   This means your network is blocking port 27017');
  });

  socket.on('timeout', () => {
    console.log('   ❌ Connection timeout');
    socket.destroy();
  });
}

testConnection();

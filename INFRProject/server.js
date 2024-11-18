const http = require('http');
const app = require('./app'); 
require('./config/db'); // Ensure the MongoDB connection is initialized

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

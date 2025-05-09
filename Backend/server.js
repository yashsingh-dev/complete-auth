const logger = require('./src/config/logger.config');
const app = require('./src/app');
const http = require('http');
const PORT = process.env.PORT || 3000

const server = http.createServer(app);

server.listen(PORT, ()=>{
    logger.info(`Server is running at port ${PORT}`);
});
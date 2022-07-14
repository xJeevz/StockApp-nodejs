# StockApp-nodejs
Stock Trader App made in NodeJs
so install npm 

## Node.js modules used in this (install them)
    "axios": "^0.27.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "express-session": "^1.17.3",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.4.4",
    "nodemon": "^2.0.19"

# BEFORE RUNNING
Make sure to have a MongoDB driver code connected to it and a JWT Secret key. In order to connect it, create a file in the folder called .env and write these lines but replace the after = with your own key/code.  
       DB_CONNECTION=mongodb+srv://username:password@cluster0...  
       JWT_SECRET=sdjkfh8923yhjdks...  

MongoDB: I used the free cloud MongoDB database on https://cloud.mongodb.com/ to create a database  
JWT: I used https://jwt.io/#debugger-io to create a JWT Secret  

# TO RUN
command: npm start  
the server should run in http://localhost:3000/


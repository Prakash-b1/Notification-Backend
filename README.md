Baakcend Setup
1. Install dependencies

cd backend
npm install

2. Configure environment

Create a .env file in the backend/ directory with:

PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>

3. Start the server

npm start

The backend will run on http://localhost:5000.

apis

http://localhost:5000/api/auth/signup
http://localhost:5000/api/auth/login
http://localhost:5000/api/auth/user
http://localhost:5000/api/notifications
http://localhost:5000/api/notifications


Creds 

Manager
email:test@gmail.com
paass:password123

user
email:user@gmail.com
pass:user@123
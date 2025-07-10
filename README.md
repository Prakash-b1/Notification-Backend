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
# System Test Task: E-commerce Campaign Reporting API with JWT Authentication

This is a Node.js Express-based backend application that provides:

- User management (CRUD + login with JWT auth)
- Product reporting APIs with cross-filtering and aggregation
- Pagination & search API for product lists
- Test coverage using Jest

---

## Technologies Used

- Node.js
- Express
- Sequelize ORM
- SQLite (Database)
- JWT (Authentication)
- Jest (Testing)
- Winston (Logging)

---

## 📦 Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/avinash9697/techsavvy-assignment.git
cd ecommerce-campaign-reporting

# 2. Install dependencies
npm install

# 3. No need to create .env since it's already included

# 4. Start the development server
npm start

# 5. Run unit tests
npm test
```

---

## 🔐 Authentication - Login

To access protected user routes,reports and product routes you must first login and obtain a JWT token.

### 🔹 Endpoint: POST /login

```json

**Request Body:**

{
"username": "admin",
"password": "admin123"
}

**Sample Response:**

{
"message": "Login Succesful",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

🔑Usage
Use the returned token in the Authorization header of secured API calls:

Authorization: Bearer <your_token_here>

---

👥 User Management

➕ Create User (Register)
Creates a new user account. No authorization required.

🔸 Endpoint - POST /users
📥 Request Body (required)

{
"username": "newuser",
"password": "securepassword123",
"email": "newuser@example.com"
}
🔐 Password will be hashed before storing.

📥 Example Request

POST /users

Body:

{
"username":"newuser12",
"password":"123456291",
"email":"test1434122@email.com"
}
📤 Sample Response (Success)

{
"message": "User Created",
"user": {
"id": 11,
"username": "newuser12"
}
}

---

📍 Get Users
Fetches a single user or all users depending on whether an id is provided in the request params.

🔸 Endpoint - GET /users/:id?
If :id is provided → returns the user with that ID.

If no id → returns all users.

🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>
📥 Example Request (All Users)

GET /users
Headers:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📤 Sample Response (All Users)

{
"users": [
{
"id": 1,
"username": "Avinash",
"email": "test@email.com"
},
{
"id": 2,
"username": "Avinash2",
"email": "test2@email.com"
}
]
}

📥 Example Request (Single User)

GET /users/1
📤 Sample Response (Single User)

{
"user": {
"id": 1,
"username": "Avinash",
"email": "test@email.com"
}
}

---

📝 Update User
Updates a user's information by their ID.

🔸 Endpoint - PUT /users/:id
🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>
📥 Request Body
You can send any of the following fields to update:

{
"username": "updatedName",
"email": "updated@email.com",
"password": "newpassword123"
}
🔐 Note: If password is included, it will be hashed before saving.

📥 Example Request
PUT /users/1

Headers:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body:

{
"username": "my assignment test",
}
📤 Sample Response

{
"message": "User updated",
"user": {
"username": "my assignment test"
}
}

---

❌ Delete User
Deletes a user by their ID.

🔸 Endpoint - DELETE /users/:id

🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>

📥 Example Request

DELETE /users/1
Headers:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📤 Sample Response
{
"message": "User deleted successfully"
}

---

📤 Upload CSV File (Bulk Product Import)
Uploads a CSV file which will be parsed and inserted into the products table in the SQLite database.

🔸 Endpoint - POST /upload-csv
🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>
📥 Request
Content-Type: multipart/form-data

Form Data:

Key - file

sample reponse

{
message: "CSV uploaded and saved",
inserted: 48,
}

---

📊 Reports API
Fetch product campaign reports based on a main filter and optional additional filters. The response includes aggregated data matching the filters.

🔸 Endpoint - POST /products/report/campaign (main filter is Campaign Name)
🔸 Endpoint - POST /products/report/adGroupId (main filter is Ad Group ID)
🔸 Endpoint - POST /products/report/fsnID (main filter is FSN ID)
🔸 Endpoint - POST /products/report/productName (main filter is Product Name)

🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>

📥 Request Body

{
"Product Name":"Dalda Sunflower Oil Jar"
,"filters":{
"Campaign Name":"KW-NB-Dalda Sunflower Oil-5L- Mum Delhi Patna"
}
}

Response

{
"data": [
{
"product": "Dalda Sunflower Oil Jar",
"AdSpend": 5999.5,
"Views": 68361,
"Clicks": 1078,
"CTR": 1.58,
"TotalRevenue": 346223,
"TotalOrders": 891,
"ROAS": 57.71
}
],
"status_code": 200
}

Here the response will be the accumulated values of passing filters as there is no differentiate keys in the expect response the values are being aggregated.

---

📋 Products List API with Pagination & Filtering
Retrieve a paginated list of products with optional filtering by campaign name, FSN ID, Ad Group ID, or Product Name via query parameters.

🔸 Endpoint - GET /productslist
🔑 Authentication Required
Yes — JWT token must be included in the Authorization header.

Authorization: Bearer <your_token_here>
📥 Query Parameters

campaignname, productname, fsnid, adgroupid, By Default Page 1 and Limit 10

📥 Example Request

http://localhost:5000/productslist?campaignname=PLA-Cross selling-Dalda 1L

sample response

{
"data": [
{
"id": 674,
"campaignid": "WL64UDTTYT9A",
"campaignname": "PLA-Cross selling-Dalda 1L",
"adgroupid": "RZPNNZ8LY3PP",
"fsnid": "EDOFCSBGHFQ9YKAA",
"productname": "Dalda Kachi Ghani Mustard Oil PET Bottle",
"adspend": 2089.6,
"views": 89396,
"clicks": 464,
"directunits": 236,
"indirectunits": 102,
"directrevenue": 31244,
"indirectrevenue": 15939
},
{
"id": 680,
"campaignid": "WL64UDTTYT9A",
"campaignname": "PLA-Cross selling-Dalda 1L",
"adgroupid": "RZPNNZ8LY3PP",
"fsnid": "EDOFCSBGHWN6SC2G",
"productname": "Dalda Sunflower Oil Pouch",
"adspend": 3869.35,
"views": 40690,
"clicks": 852,
"directunits": 673,
"indirectunits": 228,
"directrevenue": 74669,
"indirectrevenue": 34313
},
{
"id": 683,
"campaignid": "WL64UDTTYT9A",
"campaignname": "PLA-Cross selling-Dalda 1L",
"adgroupid": "RZPNNZ8LY3PP",
"fsnid": "EDOFCSBGS8AYG6HK",
"productname": "Dalda Soyabean Oil Pouch",
"adspend": 1591.35,
"views": 21269,
"clicks": 349,
"directunits": 261,
"indirectunits": 90,
"directrevenue": 29712,
"indirectrevenue": 13433
}
],
"pagination": {
"page": 1,
"limit": 10,
"totalRecords": 3,
"totalPages": 1
},
"status_code": 200
}


Final Notes

- All protected routes require a valid JWT token in the Authorization header.
- Passwords are securely hashed before storing.
- The project includes comprehensive unit tests run via npm test.
- Logging is done with Winston for easy debugging and monitoring.

```

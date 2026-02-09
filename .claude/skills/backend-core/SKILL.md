name: backend-core-skill
description: Build backend applications with proper routing, request handling, database connections, and business logic organization.
---

# Backend Core Skill

## Routing
- Create RESTful routes (GET, POST, PUT, DELETE)  
- Organize routes by feature/module  
- Use clear and meaningful endpoint names  

## Request & Response Handling
- Validate incoming request data  
- Handle headers, params, body, and query  
- Send proper HTTP status codes and JSON responses  

## Database Connection
- Connect to databases (MongoDB, PostgreSQL, MySQL)  
- Use ORM/ODM when needed  
- Handle connection errors safely  

## Business Logic
- Separate logic from routes (controllers/services)  
- Keep code clean and reusable  
- Handle async operations properly  

## Best Practices
- Follow MVC or service-based architecture  
- Always validate and sanitize user input  
- Use environment variables for secrets  
- Handle errors with try/catch or middleware  
- Keep APIs consistent and predictable  

## Example Structure
```javascript
// routes/user.routes.js
import express from "express";
import { createUser, getUsers } from "./controllers/user.controller.js";

const router = express.Router();

router.post("/users", createUser);
router.get("/users", getUsers);

export default router;

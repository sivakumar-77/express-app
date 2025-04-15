# express-app

## 🚀 Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js (v14 or higher)](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## 🛠 Environment Setup

If your MySQL in Local then add DB Credential `.env` file in the root of the project with the following content:

```env
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=myapp
```

run `docker compose up` to run the MySQL container

# Create Tables

we have only users table, run the SQL script in the `db_script.sql` file.

# Install Packages

run `npm install`

# Start the server

run `npm start`

# Postman Collection

1. User Login
2. User register
3. User Get Info using User Token
   pls add User Token as Bearer Token in Header should be
   Authorization: Bearer `<user_token>`

## 📊 Chat Import Feature

The application supports importing chat history from Excel files. This feature allows you to bulk import chat messages between users.

### Excel File Format Requirements

- **Supported File Formats**: Excel files only (.xlsx, .xls)
- **Maximum File Size**: 5MB
- **File Limit**: Only one file can be uploaded at a time

Your Excel file must contain the following columns:

I have added sample excel file  `sample_chat_messages.xlsx`

- `sender_id` - ID of the message sender
- `receiver_id` - ID of the message recipient
- `message` - Text content of the message
- `timestamp` - Date and time of the message (format: YYYY-MM-DD HH:MM:SS)

Example:

| sender_id | receiver_id | message                 | timestamp           |
| --------- | ----------- | ----------------------- | ------------------- |
| 1         | 2           | Hello, how are you?     | 2023-06-15 10:30:00 |
| 2         | 1           | I'm doing well, thanks! | 2023-06-15 10:32:00 |

### Testing Chat Import in Postman

1. **Authenticate First**

   - Send a POST request to `/user/login` with your credentials
   - Save the JWT token from the response
2. **Set Up the Import Request**

   - Create a new POST request to `/chat/import`
   - Under the "Authorization" tab:
     - Select "Bearer Token" from the Type dropdown
     - Paste your JWT token in the Token field
3. **Attach the Excel File**

   - Select the "Body" tab
   - Choose "form-data"
   - Add a key named "chatFile"
   - Click the dropdown on the right of the key and select "File"
   - Click "Select File" and choose your Excel file
4. **Send the Request**

   - Click the "Send" button
   - You should receive a success response if the import was successful
5. **Verify Import**

   - You can check the imported messages by querying your chat in the database, sql query is avaialble in `db_script.sql` file

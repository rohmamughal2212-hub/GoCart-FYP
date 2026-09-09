This file describes how to run MongoDB locally for this project.

1) Run MongoDB Community Server on Windows

- Download & install from: https://www.mongodb.com/try/download/community
- Create data directory (one-time):

  ```powershell
  mkdir C:\data\db
  ```

- Start server (in a PowerShell window):

  ```powershell
  mongod --dbpath C:\data\db --bind_ip 127.0.0.1
  ```

2) Environment variable override

- To run the backend pointing at a different Mongo URI:

  ```powershell
  $env:MONGO_URI='mongodb://127.0.0.1:27017/grocery-app'; npm run --prefix Backend dev
  ```

The backend also has fallback storage for development when MongoDB is unavailable, but persistent MongoDB data requires a running local `mongod` service.

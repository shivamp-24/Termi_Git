# TermiGit

A terminal-based version control system inspired by Git, built with Node.js and designed to manage repositories using familiar console commands. TermiGit supports repository initialization, file staging, commits, and cloud synchronization with AWS S3, with plans for a web frontend and MongoDB integration for user and repository management.

## Features

- **Console Commands**:
  - `init`: Initialize a repository with a `.myGit` folder.
  - `add <file>`: Stage files for commit.
  - `commit <message>`: Create a commit with a unique ID.
  - `push`: Sync changes to an AWS S3 bucket.
  - `pull`: Retrieve updates from S3 to the local repository.
  - `revert <commit-id>`: Revert to a specific commit.
- **Planned Web Frontend**:
  - User authentication (signup/login).
  - Dashboard with recent contributions (heatmap graph) and user details.
  - Repository creation, searching, and listing.
  - Issue management (create, update, delete).
- **Planned Backend**:
  - MongoDB schemas for users, repositories, and issues.
  - RESTful APIs for user, repository, and issue operations.

## Progress

### Day 1: Project Planning and Backend Foundation

- **Project Planning**:
  - Defined console commands: `init`, `add`, `commit`, `push`, `pull`, `revert`.
  - Outlined frontend components: Authentication, Dashboard, Repository, Admin.
  - Designed MongoDB schemas for `User`, `Repository`, and `Issue`.
  - Planned API endpoints for user, repository, and issue management with modular routing.
- **Backend Setup**:
  - Initialized a Node.js backend with `npm init -y`.
  - Configured `package.json` with a `start` script: `"node index.js"`.
  - Created a `backend` folder with a `controllers/` directory for command logic (`init.js`, `add.js`, `commit.js`, `push.js`, `pull.js`, `revert.js`).
  - Installed `yargs` (`npm install yargs`) for command-line argument parsing.
- **Command Parsing**:
  - Implemented `index.js` to parse terminal commands using `yargs`.
  - Defined commands with `yargs.command()`, linking to controller functions.
  - Used `positional` attributes for arguments (e.g., file names, commit messages) and enabled `.help()` for user assistance.
  - Set `demandCommand(1)` to ensure a command is provided.
- **Core Command Logic**:
  - **Init Command**:
    - Used `fs.promises` and `path` to create a `.myGit` folder in the current directory (`process.cwd()`).
    - Created a `commits/` subfolder and a `config.json` file for repository metadata.
    - Implemented async/await with `try-catch` for error handling during file operations.
  - **Add Command**:
    - Created a `stagingArea/` folder within `.myGit` to store staged files.
    - Copied specified files to `stagingArea/` using `fs.copyFile()`.
    - Added async/await and `try-catch` for robust file handling.
  - **Commit Command**:
    - Installed `uuid` (`npm install uuid`) to generate unique commit IDs with `v4`.
    - Created a commit folder in `commits/` with the UUID.
    - Copied staged files from `stagingArea/` to the commit folder.
    - Generated a `commit.json` file with commit metadata (message, timestamp).
    - Used async/await and `try-catch` for file operations.

### Day 2: AWS S3 Integration, Backend Enhancements, and MongoDB Setup

- **AWS S3 Configuration**:
  - Created an AWS account, IAM user, and S3 bucket for repository storage.
  - Configured the S3 bucket policy to allow access for `push` and `pull` operations.
  - Installed `aws-sdk` (`npm install aws-sdk`) to interact with S3 for file uploads and downloads.
  - Set up `aws-config.js` to configure S3 client and bucket, using credentials stored in a `.env` file.
  - Installed `dotenv` (`npm install dotenv`) to securely load AWS access ID and secret key from `.env`.
- **Push Command Logic**:
  - Implemented `push` command to upload commit data to S3.
  - Iterated through `commits/` directories and files using `fs.promises.readdir` and `fs.promises.readFile`.
  - Uploaded files to the S3 bucket with `aws-sdk`, maintaining the commit folder structure.
  - Used async/await and `try-catch` for robust error handling during file operations.
- **Pull Command Logic**:
  - Developed `pull` command to retrieve commit data from S3.
  - Fetched commit folders using `s3.listObjectsV2` with a `commits/` prefix.
  - Recreated commit directories locally with `fs.promises.mkdir` and wrote files using `fs.promises.writeFile`.
  - Handled errors with async/await and `try-catch` for reliable file operations.
- **Revert Command Logic**:
  - Implemented `revert` command to restore a repository to a specific commit.
  - Used `util.promisify` to enhance `fs.readdir` and `fs.copyFile` with error-throwing capabilities.
  - Located the target commit ID folder in `commits/` and copied its files to the parent directory (`backend/`) using custom promisified functions.
  - Ensured error handling with async/await and `try-catch`.
- **Backend Folder Structure**:
  - Created `middlewares/` folder for future authentication (valid credentials) and authorization (access control) logic.
  - Added `routes/` folder for planned API endpoints.
  - Established `models/` folder for MongoDB schemas (`userModel`, `repoModel`, `issueModel`).
  - Defined a custom command in `yargs` to start the server, ensuring `.demandCommand(1)` compatibility.
- **MongoDB Setup**:
  - Set up a MongoDB Atlas organization, project, and cluster.
  - Stored the connection string, username, and password in `.env` for secure access.
- **Server Creation**:
  - Installed backend dependencies: `express`, `dotenv`, `cors`, `mongoose`, `body-parser`, `http` (`npm install express dotenv cors mongoose body-parser http`) for server setup and API handling.
  - Installed `socket.io` (`npm install socket.io`) for real-time communication with logged-in users.
  - Created a server in `startServer()` using `express`, parsing JSON with `body-parser` and enabling CORS (`cors({ origin: "*" })`) for flexible client access.
  - Configured MongoDB connection with `mongoose`, using `dotenv.config()` to load the connection string.
  - Set up a Socket.IO server with `http` and `socket.io`, defining `GET` and `POST` methods for client requests.
  - Implemented `io.on()` to handle user connections and `db.once()` to initialize CRUD operations on first connection.
  - Started the server with `httpServer.listen()` on a port defined in `.env`.
- **Database Schemas**:
  - Followed MVC architecture for modularity, defining schemas in `models/`.
  - Created `userSchema` with fields: `username`, `email`, `password`, `repositories` (ref: Repository), `followedUsers` (ref: User), `starRepos` (ref: Repository).
  - Defined `repoSchema` with fields: `name`, `description`, `content`, `visibility`, `owner` (ref: User), `issues` (ref: Issue).
  - Established `issueSchema` with fields: `title`, `description`, `status`, `repository` (ref: Repository).

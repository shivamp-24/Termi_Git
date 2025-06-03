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

# MongoDB Setup Guide for CommitLog

## Prerequisites
You need MongoDB running locally or a MongoDB Atlas connection string.

## Option 1: Local MongoDB (Recommended for Development)

### Installation

**Ubuntu/Debian Linux:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

**Windows (WSL2):**
```bash
# Download and install MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Or using Windows Subsystem for Linux:
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Verify Installation
```bash
# Check if MongoDB is running
mongosh --version

# Connect to MongoDB shell
mongosh

# You should see: "test>" prompt
# Type "exit" to quit
```

### Default Connection String
```
mongodb://127.0.0.1:27017/commitlog
```

This is already configured in the `.env` file.

## Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 free tier is sufficient)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/commitlog?retryWrites=true&w=majority
```

Replace `username` and `password` with your actual credentials.

## Troubleshooting

### MongoDB not starting on Linux
```bash
# Check MongoDB service status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Connection refused error
- Verify MongoDB is running: `pgrep -x mongod`
- Check if port 27017 is in use: `sudo netstat -tulpn | grep 27017`
- Ensure the connection string in `.env` matches your setup

### Database permissions
MongoDB running locally doesn't require authentication by default. If you've enabled auth, update your connection string:
```
mongodb://username:password@127.0.0.1:27017/commitlog
```

## Next Steps
Once MongoDB is running, start the CommitLog server:
```bash
cd server
npm run dev
```

The server will automatically connect to MongoDB and create the `commitlog` database when you add your first record.

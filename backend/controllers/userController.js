const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //establish connection
    await connectClient();

    //find the db and create a new collection
    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });

    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    //hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: result.insertId });
  } catch (error) {
    console.error("Error during signup : ", error.message);
    res.status(500).send("Server error!");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    await connectClient();

    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    //check if user exists with given email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    //check if passwords match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    //if correct details => return the token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Error during login : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getAllUsers = async (req, res) => {
  try {
    await connectClient();

    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    //find all users
    const users = await usersCollection.find({}).toArray();

    res.json(users);
  } catch (error) {
    console.error("Error during fetching : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    await connectClient();

    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    //find the user with corresponding id
    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error during fetching : ", error.message);
    res.status(500).send("Server error!");
  }
};

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();

    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    //updateFields will store updated fields
    let updateFields = { email };

    //if password is also provided in body, then update it in updateFields
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    //check if user exists with given id and update
    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentID),
      },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "UserProfile updated", result });
  } catch (error) {
    console.error("Error during updating : ", error.message);
    res.status(500).send("Server error!");
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    await connectClient();

    const db = client.db("termigit");
    const usersCollection = db.collection("users");

    //find the user with given id and delete if exists
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User Profile Deleted" });
  } catch (error) {
    console.error("Error during deleting : ", error.message);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  getAllUsers,
  login,
  signup,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};

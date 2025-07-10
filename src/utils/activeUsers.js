import User from "../models/User.js";

// This object will store online users in the format: { userId: socketId }
export const activeUsers = {};

/**
 * Adds a new user to the active users list.
 * @param {string} userId - The unique ID of the user.
 * @param {string} socketId - The socket ID of the connection.
 */
export const addActiveUser = (userId, socketId) => {
  activeUsers[userId] = socketId;
  console.log('Active Users:', activeUsers);
};

/**
 * Removes a user from the active users list using their socket ID.
 * @param {string} socketId - The socket ID to remove.
 */
export const removeActiveUserBySocketId = (socketId) => {
  // Find the userId associated with the socketId
  const userId = Object.keys(activeUsers).find(key => activeUsers[key] === socketId);
  if (userId) {
    delete activeUsers[userId];
    console.log(`User ${userId} removed.`);
    console.log('Active Users:', activeUsers);
    return userId;
  }
  return null;
};


/**
 * Checks if a user is currently online.
 * @param {string} userId - The ID of the user to check.
 * @returns {boolean}
 */
export const isUserOnline = (userId) => {
  return userId in activeUsers;
};


export const getInactiveUserIds = async () => {
  // 1) Fetch all users’ IDs from the DB
  const allUsers = await User.find({}, '_id').lean();
  const allIds   = allUsers.map(u => u._id.toString());

  // 2) Filter out those who are in activeUsers
  const inactive = allIds.filter(id => !(id in activeUsers));

  return inactive;
};
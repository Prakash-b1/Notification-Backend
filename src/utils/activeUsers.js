export const activeUsers = {};

export const isUserOnline = (userId) => {
  return Object.values(activeUsers).includes(userId);
};

export const addActiveUser = (socketId, userId) => {
  activeUsers[socketId] = userId;
};

export const removeActiveUser = (socketId) => {
  delete activeUsers[socketId];
};

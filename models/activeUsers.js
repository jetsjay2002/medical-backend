const activeTokens = new Set();

const add = (token) => {
    
    activeTokens.add(token);  // Add token to activeTokens set
    console.log(`Adding token to activeUsers: ${token}`);

};

const isActive = (token) => {
    return activeTokens.has(token);  // Check if token is in activeTokens set
};

const removeToken = (token) => {
    activeTokens.delete(token);  // Remove token from activeTokens set
};

const getAll = () => {
    return activeTokens;  // Return all active tokens
};

module.exports = {
    add,
    isActive,
    removeToken,
    getAll
};

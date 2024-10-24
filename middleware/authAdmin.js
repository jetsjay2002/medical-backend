const authenticateAdmin = (req, res, next) => {
  const { user } = req;

  console.log('User received in authenticateAdmin:', user);  // Log the user object

  if (!user) {
    console.log('Access forbidden: No user found in request');
    return res.status(403).json({ error: 'Access forbidden: No user found' });
  }

  // Make sure we're checking the correct field, whether it's UserTypesID or usertypesid
  const userTypeId = user.UserTypesID || user.usertypeid;
  console.log('Checking UserTypesID:', userTypeId);
  if (userTypeId === 'T01') {
    console.log('User is an Admin. Proceeding...');
    next();  // Proceed if the user is an Admin
  } else {
    console.log(`Access forbidden: User is not an admin. usertypesid: ${userTypeId}`);
    return res.status(403).json({ error: 'Access forbidden: Admins only' });
  }
};

module.exports = { authenticateAdmin };

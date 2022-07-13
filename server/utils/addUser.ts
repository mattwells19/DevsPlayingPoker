const addUser = async (name, users) => {
  const userId = await users.insertOne({
    name,
  });
  console.debug(`Created userId: ${userId} for name: ${name}`);
  return userId;
};

export default addUser;

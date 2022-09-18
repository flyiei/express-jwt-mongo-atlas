//  const usersDB = {
//     users: require('../model/users.json'),
//     setUsers: function (data) { this.users = data }
// }
// const fsPromises = require('fs').promises;
// const path = require('path');
const User = require('../model/User')
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    // check for duplicate usernames in the db
    // const duplicate = usersDB.users.find(person => person.username === user);
    // 'findOne' normally don't need 'exec()' if there is a callback function.
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        
        //Store the new user, no need to give role, since there is a default value has been given in User Scheme
        const result = await User.create({
            "username": user,
            "password": hashedPwd
        });
        console.log(result);

        // usersDB.setUsers([...usersDB.users, newUser]);
        // await fsPromises.writeFile(
        //     path.join(__dirname, '..', 'model', 'users.json'),
        //     JSON.stringify(usersDB.users)
        // );
        // console.log(usersDB.users);
        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };
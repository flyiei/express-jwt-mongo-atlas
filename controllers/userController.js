const { json } = require('express');
const bcrypt = require('bcrypt');
const User = require('../model/User')

const createUser = async (req, res) => {
    const { user, pwd, roles } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        
        //Store the new user, no need to give role, since there is a default value has been given in User Scheme
        const result = await User.create({
            "username": user,
            "password": hashedPwd,
            "roles": roles
        });
        console.log(result);

        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}


const getAllUsers = async (req, res) => {

    const users = await User.find();
    if (!users) return res.status(204).json({ 'message': 'No user found.' });
    res.json(users)
}

const updateUser = async (req, res) => {

    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }
    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `No user matchs ID ${req.body.id}.` });
    }

    if (req.body?.user) user.username = req.body.user;
    if (req.body?.roles) user.roles = req.body.roles;
    if (req.body?.pwd) {
        const hashedPwd = await bcrypt.hash(req.body.pwd, 10);
        user.password = hashedPwd;
    }
    

    const result = await user.save();
    res.json(result);
}

const deleteUser = async (req, res) => {
    if (!req?.body?.id)
        return res.status(400).message({ 'message': 'User ID is required' });
    const user = await User.findOne({ _id: req.body.id });
    if (!user)
        return res.status(204).json({ 'message': `No User matches ID ${req.body.id}.` });
    const result = await User.deleteOne({ _id: req.body.id })

    res.json(result);

}


const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required!' })
    const user = await User.findOne({ _id: req.params.id })
    if (!user) return res.status(204).json({ 'message': `No user matches ID ${req.params.id}.` })

    res.json(user);
}




module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUser
}
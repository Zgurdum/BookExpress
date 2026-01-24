// Services/messagesService.js

const messagesDao = require('../DAO/messagesDao');
const userService = require('./user_servisi');

async function getAllMessagesForUser(userId) {
    return await messagesDao.getAllMessagesForUser(userId);
}

async function getConversationHistory(userId, receiverId) {
    return await messagesDao.getConversationHistory(userId, receiverId);
}

async function markMessagesAsRead(senderId, receiverId) {
    return await messagesDao.markMessagesAsRead(senderId, receiverId);
}

async function getUserById(userId) {
    return await userService.getKorisnikDetails(userId);
}

module.exports = {
    getAllMessagesForUser,
    getConversationHistory,
    markMessagesAsRead,
    getUserById
};
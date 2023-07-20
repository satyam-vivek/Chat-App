const users = []

const addUser = ({id, username, room}) => {
    //Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser) {
        return {
            error: 'Username in use'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)

    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0] 
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    return user
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    const userInRoom = users.filter((user) => {
        return user.room === room
    })
    return userInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'HTML intro',
    author: 'john smith',
    url: 'blogs.com/htmlintro',
    likes: 40
  },
  {
    title: 'JS advanced',
    author: 'lily brown',
    url: 'blogs.com/jsadvanced',
    likes: 102
  }
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  usersInDb
}
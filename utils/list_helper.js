const { values } = require('lodash')
const { groupBy } = require('lodash')
const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => acc + curr.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (!blogs.length) return {}
  const maxLikesBlog = blogs.reduce((max, curr) => curr.likes > max.likes ? curr : max)

  return {
    title: maxLikesBlog.title,
    author: maxLikesBlog.author,
    likes: maxLikesBlog.likes
  }
}

const mostBlogs = (blogs) => {
  if (!blogs.length) return {}
  const groupByAuthor = _.groupBy(blogs, 'author')
  const authorBlogs = _.mapValues(groupByAuthor, (array) => array.length)
  const authorsArray =
    Object.keys(authorBlogs).map(author => {
      return {
        'author': author,
        'blogs': authorBlogs[author]
      }
    })

  const authorWithMostBlogs =
    authorsArray.reduce((arr, curr) => {
      return arr.blogs < curr.blogs ? curr : arr
    })

  return authorWithMostBlogs
}

const mostLikes = (blogs) => {
  if (!blogs.length) return {}
  const groupByAuthor = _.groupBy(blogs, 'author')
  const authorLikes = _.mapValues(groupByAuthor, (array) => {
    return array.reduce((acc, curr) => acc + curr.likes, 0) 
  })

  const authorsArray =
    Object.keys(authorLikes).map(author => {
      return {
        'author': author,
        'likes': authorLikes[author]
      }
    })

  const authorWithMostLikes =
    authorsArray.reduce((arr, curr) => {
      return arr.likes < curr.likes ? curr : arr
    })

  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

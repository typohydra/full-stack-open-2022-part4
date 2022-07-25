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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}

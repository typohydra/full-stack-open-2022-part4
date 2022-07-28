const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_api_helper')
const app = require('../app')
const api = supertest(app)

const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

const newToken = async () => {
  const user = {
    username: 'testerUser',
    name: 'tester user',
    password: 'test'
  }

  // create new user
  await api.post('/api/users').send(user)
  // login user to get token
  const response = await api.post('/api/login').send(user)

  return response.body.token
}

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('all blogs are in json format', async() => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property is named id', async() => {
  const response = await api.get('/api/blogs')
  for(const blog of response.body) {
    expect(blog.id).toBeDefined()
  }
})

test('new blog is added', async () => {
  const token = await newToken()

  const newBlog = {
    title: 'test title',
    author: 'test author',
    url: 'test url',
    likes: 200
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`) 
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogs = response.body
  expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
  
  const urls = blogs.map(b => b.url)
  expect(urls).toContain('test url')
})

test('if likes property is missing default to 0', async () => {
  const token = await newToken()

  const newBlog = {
    title: 'test title',
    author: 'test author',
    url: 'test url'
  }

  const response = await 
    api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`) 
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
  expect(response.body.likes).toBe(0)
})

test('title and url missing respond 400 bad request', async () => {
  const token = await newToken()

  const newBlog = {
    author: 'test author',
    likes: 42
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`) 
    .send(newBlog)
    .expect(400)
})

test('delete blog', async () => {
  const token = await newToken()

  // add new blog to delete
  const newBlog = {
    title: 'test title to delete',
    author: 'test author to delete',
    url: 'test url to delete',
    likes: 200
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`) 
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // delete last blog
  const responseBeforeDel = await api.get('/api/blogs')
  const blogsBefore = responseBeforeDel.body

  await api
    .delete(`/api/blogs/${blogsBefore[blogsBefore.length-1].id}`)
    .set('Authorization', `bearer ${token}`) 
    .expect(204)

  const responseAfterDel = await api.get('/api/blogs')
  const blogsAfter = responseAfterDel.body
  expect(blogsAfter).toHaveLength(blogsBefore.length-1)

  const urls = blogsAfter.map(b => b.url)
  expect(urls).not.toContain(blogsBefore[blogsBefore.length-1].url)
})

test('update blog', async () => {
  const responseBeforeUp = await api.get('/api/blogs')
  const blogsBefore = responseBeforeUp.body

  await api
    .put(`/api/blogs/${blogsBefore[blogsBefore.length-1].id}`)
    .send({likes: 4242})
    .expect(200)

  const responseAfterUp = await api.get('/api/blogs')
  const blogsAfter = responseAfterUp.body
  expect(blogsAfter).toHaveLength(blogsBefore.length)
  
  const likes = blogsAfter.map(b => b.likes)
  expect(likes[blogsBefore.length-1]).toBe(4242)
})

describe('when invalid user is created', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('username and password missing', async () => {
    const usersBefore = await helper.usersInDb()
    
    const newUser = {
      username: '',
      name: 'test',
      password: '',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter).toHaveLength(usersBefore.length)
  })

  test('username isn\'t unique', async () => {
    const usersBefore = await helper.usersInDb()
    
    const newUser = {
      username: 'root',
      name: 'test',
      password: 'test',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect({error: 'username must be unique'})

    const usersAfter = await helper.usersInDb()
    expect(usersAfter).toHaveLength(usersBefore.length)
  })
})

test('adding a blog fails with status code 401 Unauthorized if a token is not provided', async () => {
  const newBlog = {
    title: 'test title',
    author: 'test author',
    url: 'test url',
    likes: 200
  }

  await api
    .post('/api/blogs')
    .set('Authorization', null) 
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body
    expect(blogs).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})

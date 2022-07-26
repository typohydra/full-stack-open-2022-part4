const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_api_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

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

afterAll(() => {
  mongoose.connection.close()
})

const Mongolass = require('mongolass')
const mongolass = new Mongolass('mongodb://localhost:27017/test')
const User = mongolass.model('User')
const Post = mongolass.model('Post')
const Comment = mongolass.model('Comment')

exports.createUser = async function (ctx) {
  // 模拟十分之一出错概率
  if (Math.random() < 0.1) {
    console.error('error')
    ctx.throw(400)
  }
  const name = ctx.query.name || 'default'
  const age = +ctx.query.age || 18
  await createUser(name, age)
  console.error('user created')
  ctx.status = 204
}

async function createUser (name, age) {
  const user = (await User.create({
    name,
    age
  })).ops[0]
  await createPost(user)
}

async function createPost (user) {
  const post = (await Post.create({
    uid: user._id,
    title: 'post',
    content: 'post'
  })).ops[0]

  await createComment(user, post)
}

async function createComment (user, post) {
  await Comment.create({
    userId: user._id,
    postId: post._id,
    content: 'comment'
  })
}

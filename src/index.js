const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);

  if (!user) {
		return response.status(400).json({ error: "User not found."});
  }

  request.user = user;

  return next();
}

// creates a user
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some(user => user.username === username)

  if (usernameExists) {
    return response.status(400).json({error: "Username already exists."})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

// lists the ToDo list of the user
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {  user } = request;
  return response.status(201).json(user.todos);
});

// adds a task to the ToDo list
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

// chages a task's title and deadline
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Invalid ToDo ID."})
  }

  if (title) {todo.title = title};
  if (deadline) {todo.deadline = new Date(deadline)};

  return response.status(201).json(todo);
});

// changes the done status to true
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Invalid ToDo ID."})
  }

  todo.done = true;

  return response.status(201).json(todo)
});

// deletes a task
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Invalid ToDo ID."})
  }

  const index = user.todos.indexOf(todo);

  user.todos.splice(index, 1);

  return response.status(204).json();
});

module.exports = app;
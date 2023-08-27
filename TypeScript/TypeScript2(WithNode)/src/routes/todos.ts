import { Router } from 'express';

import { Todo } from '../models/todo';

let todos: Todo[] = [];

const router = Router();

type RequestBody = {text: string};
type RequestParams = {todoId: string};

//Get todos
router.get('/', (req, res, next) => {
    res.status(200).json({todos:todos});
});

//Create todo
router.post('/todo', (req, res, next) => {
    const body = req.body as RequestBody;
    const newTodo: Todo = {
        id: new Date().toISOString(), 
        text: body.text
    };
    todos.push(newTodo);
    res.status(201).json({message: 'Added todo', todo: newTodo, todos: todos});
});

//Update todo
router.put('/todo/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;
    const body = req.body as RequestBody;

    const tid = params.todoId;
    const todoIndex = todos.findIndex(todoItem => todoItem.id === tid);

    if(todoIndex >= 0){
        todos[todoIndex] = {
            id: todos[todoIndex].id,
            text: body.text
        };
        return res.status(200).json({message: 'Updated todo', todos: todos});
    }
    res.status(404).json({message: 'Could not find todo for this ID'});
});

//Delete todo
router.delete('/todo/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;

    todos = todos.filter((todoItem) => todoItem.id !== params.todoId);
    res.status(200).json({message: 'Deleted todo', todos: todos});
});

export default router;
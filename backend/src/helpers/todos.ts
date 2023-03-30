import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

const todoAccess = new TodosAccess();
const attachmentAccess = new AttachmentUtils();

// TODO: Implement businessLogic

//Create todo function
export async function createTodo(userId: string, newTodo: CreateTodoRequest) {
    const todoId = uuid.v4()
    const newItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        ...newTodo
    }
    return todoAccess.createTodo(newItem);
}

//Get all TODO items for a current user
export async function getTodosForUser(userId: string) {
    //Get todos created by user id
    return todoAccess.getTodos(userId);
}

//Delete todo by id
export async function deleteTodo(todoId: string, userId: string) {
    //Get todos created by user id
    return todoAccess.deleteTodo(todoId, userId);
}

//Update todo
export async function updateTodo(todoId: string, userId: string, data: UpdateTodoRequest) {
    return todoAccess.updateTodo(todoId, userId, data);
}

//Check todo is exists
export async function todoExists(todoId: string, userId: string) {
    return todoAccess.checkExists(todoId, userId);
}

//Check todo is exists
export function createAttachmentPresignedUrl(attachmentId: string) {
    return attachmentAccess.generateAttachmentPresignedUrl(attachmentId);
}

//Update todo attachment url
export async function updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    return attachmentAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl);
}

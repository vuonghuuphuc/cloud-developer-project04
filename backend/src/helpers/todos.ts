//import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
//import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
import * as AWS  from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


// TODO: Implement businessLogic

//Create todo function
export async function createTodo(userId: string, newTodo: CreateTodoRequest) {
    const todoId = uuid.v4()
    const newItem = {
        userId: userId,
        todoId: todoId,
        ...newTodo
    }
    await docClient.put({
        TableName: todosTable,
        Item: newItem
    }).promise()

    return newItem
}

//Get all TODO items for a current user
export async function getTodosForUser(userId: string) {
    //Get todos created by user id
    return await docClient.query({
        TableName : todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()
}

//Delete todo by id
export async function deleteTodo(todoId: string, userId: string) {
    //Get todos created by user id
    return await docClient.delete({
        TableName: todosTable, 
        Key : {
            userId: userId,
            todoId: todoId
        }
    }).promise()
}

//Update todo
export async function updateTodo(todoId: string, userId: string, data: UpdateTodoRequest) {
    return await docClient.update({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: "set #name = :name, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues:{
          ":name": data.name,
          ":dueDate": data.dueDate,
          ":done": data.done
        },
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ReturnValues:"UPDATED_NEW"
    }).promise()
}

//Check todo is exists
export async function todoExists(todoId: string, userId: string) {
    const result = await docClient
      .get({
        TableName: todosTable,
        Key: {
          todoId: todoId,
          userId: userId
        }
      })
      .promise()
    return !!result.Item
}

//Check todo is exists
export function createAttachmentPresignedUrl(attachmentId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachmentId,
        Expires: parseInt(urlExpiration)
    })
}

//Update todo attachment url
export async function updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    return await docClient.update({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: "set attachmentUrl=:attachmentUrl",
        ExpressionAttributeValues:{
            ":attachmentUrl": attachmentUrl,
        },
        ReturnValues:"UPDATED_NEW"
    }).promise()
}

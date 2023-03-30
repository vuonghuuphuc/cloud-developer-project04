import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, todoExists, updateTodoAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as uuid from 'uuid'
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);

    //Check todo exists or not and todo must belong to logged in user
    const validTodoId = await todoExists(todoId, userId)
    if (!validTodoId) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    const attachmentId = uuid.v4();

    //Generate presigned url
    const uploadUrl = createAttachmentPresignedUrl(attachmentId);

    //Generate attachmentUrl
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
    await updateTodoAttachmentUrl(todoId, userId, attachmentUrl);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {

    constructor(
        private readonly s3Client = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly todosBucket = process.env.ATTACHMENT_S3_BUCKET,
        private readonly attachmentSignedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) {
    }

    async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string){
        return await this.docClient.update({
            TableName: this.todosTable,
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

    generateAttachmentPresignedUrl(attachmentId: string) {
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: this.todosBucket,
            Key: attachmentId,
            Expires: parseInt(this.attachmentSignedUrlExpiration)
        })
    }

}

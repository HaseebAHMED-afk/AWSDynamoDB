const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteNote(noteId: string){
    const params = {
        TableName: process.env.NOTES_TABLE,
        key: {
            id: noteId
        }
    }
    try {
        await docClient.delete(params).promise()
        return noteId
    } catch (error) {
        console.log('Error: ', error)
        return null
    }
}


export default deleteNote
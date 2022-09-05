const swagger = require('swagger-autogen')();
const outputFile = './swagger.json';
const endPointFiles = ['./onlineExam/routes/user.js','./onlineExam/routes/admin.js','./onlineExam/routes/examiner.js','./onlineExam/routes/students.js',]
swagger(outputFile,endPointFiles)
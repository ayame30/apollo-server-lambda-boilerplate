A boilerplate which using `apollo-server-lambda` built with `sequelize` with Postgres. This is only a simple boilerplate with basic showcases.

This example have implemented with these features:
- Queries:
	- users with pagination
	- user
	- posts with pagination and sorting
	- post
- Mutations:
	- signup
	- signin
	- forgotPassword
	- resetPassword - with nodemailer
	- create/update/delete post
	- file upload with AWS S3
	- pre-signed url with AWS S3
- buildspec.yml for AWS Codebuild
- sequelize migration
- dataloader

*Dockerfile still under implementation*

### Run as local

```
npm install
npm run migrate
npm run seed

sls offline
```

### Deploy 
```
sls deploy
```

### Migration
```
npm run migrate
```

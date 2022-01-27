const config = {
    secrateKey: process.env.SECRET_KEY,
	refreshSecrateKey: process.env.REFRESH_KEY,

	emailID: process.env.EMAIL_ID,
	adminEmailID: process.env.ADMIN_EMAIL_ID,
	emailPassword: process.env.EMAIL_PASSWORD,
	emailHost: process.env.EMAIL_HOST,

	AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
	REGION : process.env.REGION,
	Bucket: process.env.BUCKET,
	DocumentsBucket:process.env.DOCUMENTSBUCKET,
}

module.exports = config;
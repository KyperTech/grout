let config = {
	serverUrl: 'tessellate.elasticbeanstalk.com',
	tokenName: 'grout-client',
	fbUrl: 'https://pruvit.firebaseio.com/',
	aws: {
		region: 'us-east-1',
		cognito: {
			poolId: 'us-east-1:7f3bc1ff-8484-48dd-9e13-27e5cd3de982',
			params: {
				RoleArn: 'arn:aws:iam::823322155619:role/Cognito_HypercubeTestAuth_Role1'
			}
		}
	}
};
//Set server to local server if developing
// if (typeof window != 'undefined' && (window.location.hostname == '' || window.location.hostname == 'localhost')) {
// 	config.serverUrl = 'http://localhost:4000';
// }
export default config;

/*
| Makes the real-time operations to join a project
| using socket io.
*/
const io = require( '../../lib/socket.io-client/lib/io' );

module.exports =
	async function( client, olServer, project_id )
{
	console.log( client.count, 'io connect to', project_id );
	const cookieJar = client.defaults.jar;
	const cookie = cookieJar.getCookieStringSync( olServer );
	const socket = io.connect(
			olServer + '?projectId=' + project_id,
			{
				withCredentials: true,
				cookie: cookie,
				transports: [ 'websocket' ],
				'force new connection': true,
			}
		);
	
	let project;

	// this is a bad workaround, sometimes socket.io just doesn't seem to reply
	// (or reply to a previous connection, there are some fixes in newer versions it seems)
	// after a timeout just try again. Promise logic should discard the respective other event
	// should it occour.
	while( !project )
	{
		const promise = new Promise((resolve, reject) => {
			socket.on('joinProjectResponse', (response) => {
				if (response.error) {
					reject(response.error);
				} else {
					resolve(response.project);
				}
			});

			socket.emit(
				'joinProject',
				{ 'project_id': project_id },
				(res) => {
					if (res.error) {
						reject(res.error);
					} else {
						resolve( res.project );
					}
				}
			);

			setTimeout(() => {
				reject('Timeout occurred');
			}, 10000); // Adjust timeout duration as needed
		});
		project = await promise;
		if( !project ) console.log( client.count, '*** timeout on socket.io, retrying' );
	}
	console.log( client.count, 'iosocket disconnect' );
	socket.disconnect( );
	return project;
};

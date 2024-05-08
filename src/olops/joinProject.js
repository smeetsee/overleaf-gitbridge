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
	const res = await client.get( olServer + '/socket.io/1/?projectId=' + project_id + '&t=' + Date.now() );
	// console.log(res);
	const regexSocketToken = /([^:]*):60:60:websocket,flashsocket,htmlfile,xhr-polling,jsonp-polling/;
	const socketToken = res.data.match( regexSocketToken )[ 1 ];
	const socket = io.connect(
			olServer //+ '/socket.io/1/websocket/' + socketToken
			+ '?projectId=' + project_id,
			{
				withCredentials: true,
				cookie: cookie,
				transports: [ 'websocket' ],
				'force new connection': true,
			}
		);
	console.log(socket);
	// socket.on('joinProjectResponse', (data) => {
	// 	console.log('Received joinProjectResponse:', data);
	// 	// Handle the received data here
	// });
	// socket.on('connect', () => {
	// 	console.log('Connected to server');
	// 	// Now that the connection is established, set up message listeners
	// });

	let project;

	// console.log(socket);

	// this is a bad workaround, sometimes socket.io just doesn't seem to reply
	// (or reply to a previous connection, there are some fixes in newer versions it seems)
	// after a timeout just try again. Promise logic should discard the respective other event
	// should it occour.
	while( !project )
	{
		// const promise = new Promise( ( resolve, reject ) => {
		// 	// socket.emit(
		// 	// 	'joinProject',
		// 	// 	{ 'project_id': project_id },
		// 	// 	( self, res, owner, number ) => resolve( res )
		// 	// );
		// 	// socket.on("data",
		// 	// 	() => {
		// 	// 		console.log("connected")
		// 	// 	}
		// 	socket.on('message', function (m) { console.log(m); });
		// 	console.log('dummy');
		// 	// socket.onAny((event_name, data) => { // Added missing parentheses
		// 	// 		console.log('dummy2');
		// 	// 		console.log(event_name);
		// 	// 		console.log(data);
		// 	// 	}
		// 	// );
		// 	setTimeout( ( ) => resolve( undefined ), 1000 );
		// } );
		const promise = new Promise((resolve, reject) => {
			socket.on('joinProjectResponse', (response) => {
				console.log(response);
				if (response.error) {
					reject(response.error);
				} else {
					resolve(response);
				}
			});

			socket.emit(
				'joinProject',
				{ 'project_id': project_id },
				(res) => {
					console.log(res);
					if (res.error) {
						reject(res.error);
					} else {
						resolve( res );
					}
				}
			);

			
			// setTimeout(() => {
			// 	reject('Timeout occurred');
			// }, 10000); // Adjust timeout duration as needed
			
			console.log('Reached end of promise.')
		});
		project = await promise;
		// console.log(socket);
		console.log("This is the project: " + JSON.stringify(project));
		if( !project ) console.log( client.count, '*** timeout on socket.io, retrying' );
	}
	console.log( client.count, 'iosocket disconnect' );
	socket.disconnect( );
	return project;
};

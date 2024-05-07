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
	console.log(res);
	const regexSocketToken = /([^:]*):60:60:websocket,flashsocket,htmlfile,xhr-polling,jsonp-polling/;
	const socketToken = res.data.match( regexSocketToken )[ 1 ];
	const socket = io.connect(
			olServer + '/socket.io/1/websocket/' + socketToken + '?projectId=' + project_id,
			{
				withCredentials: true,
				cookie: cookie,
				transports: [ 'websocket' ],
				'force new connection': true,
			}
		);
	let project;

	console.log(socket);

	// this is a bad workaround, sometimes socket.io just doesn't seem to reply
	// (or reply to a previous connection, there are some fixes in newer versions it seems)
	// after a timeout just try again. Promise logic should discard the respective other event
	// should it occour.
	while( !project )
	{
		const promise = new Promise( ( resolve, reject ) => {
			// socket.emit(
			// 	'joinProject',
			// 	{ 'project_id': project_id },
			// 	( self, res, owner, number ) => resolve( res )
			// );
			socket.on("connect",
				() => {
					console.log("connected")
				}
			);
			setTimeout( ( ) => resolve( undefined ), 1000 );
		} );
		project = await promise;
		console.log(project);
		if( !project ) console.log( client.count, '*** timeout on socket.io, retrying' );
	}
	console.log( client.count, 'iosocket disconnect' );
	socket.disconnect( );
	return project;
};

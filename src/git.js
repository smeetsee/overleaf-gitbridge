/*
| Handles the git calls.
*/
const aspawn = require( './aspawn' );

// git binary to call
const gitBinary = 'git';

/*
| Clones a repository from a file url.
|
| ~gitDir: directory of the bare repository.
| ~baseDir: parent dir to clone to.
*/
const clone =
	async function( gitDir, baseDir )
{
	await aspawn( gitBinary, [ 'clone', 'file://' + gitDir ], { cwd: baseDir } );
};

/*
| Creates a bare repository.
*/
const init =
	async function( dir )
{
	await aspawn( gitBinary, [ 'init', '--bare' ], { cwd: dir } );
};

/*
| Fetches a repository and resets it to its remote state.
*/
const fetchAndReset =
	async function( dir )
{
	await aspawn( gitBinary, [ 'fetch', 'origin' ] , { cwd: dir } );
	await aspawn( gitBinary, [ 'reset', '--hard', 'origin/master' ] , { cwd: dir } );
};

/*
| Stages, commits and pushes.
|
| Currently all git errors are ignored, some need to like "nothing to commit",
| some might require better handling.
*/
const save =
	async function( count, dir, message )
{
	console.log( count, 'git staging all changes' );
	try { await aspawn( 'git', [ 'add', '--all' ], { cwd: dir }); }
	catch( e ) { console.log( e ); }

	console.log( count, 'git commit' );
	try { await aspawn( 'git', [ '-c', 'user.name="Overleaf Git Bridge"', '-c', 'user.email=""', 'commit', '-m', message ], { cwd: dir }); }
	catch( e ) { console.log( e ); }

	console.log( count, 'git push' );
	try { await aspawn( 'git', [ 'push' ], { cwd: dir } ); }
	catch( e ) { console.log( e ); }
};

/*
| Exports.
*/
module.exports =
{
	clone: clone,
	init: init,
	fetchAndReset: fetchAndReset,
	save: save,
};

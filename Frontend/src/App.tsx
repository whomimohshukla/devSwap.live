import { useState } from "react";

import "./App.css";

function App() {
	
	return (
		<>
			<div className='bg-blue-800 text-center p-4 m-4 text-red-500'>
				<h1 className='text-3xl font-bold'>
					Welcome to <span className='text-blue-600'>DevSwap.live</span>
				</h1>
				<p className='text-xl'>
					This is a sample application to demonstrate the use of WebSockets
					for real-time communication between the server and the client.
				</p>
				<p className='text-xl'>
					The server is running at{" "}
					<span className='text-blue-600'>ws://localhost:5000</span> and
					the client is running at{" "}
					<span className='text-blue-600'>http://localhost:3000</span>.
				</p>
				<p className='text-xl'>
					To start the server, run{" "}
					<span className='text-blue-600'>npm run dev</span> in the server
					directory.
				</p>
				<p className='text-xl'>
					Once the server is running, open a new terminal window and run{" "}
					<span className='text-blue-600'>npm run dev</span> in the client
					directory.
				</p>
			</div>
		</>
	);
}

export default App;

import type { AppProps } from 'next/app'
import '../styles/index.css'
import { ToastContainer } from 'react-toastify'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Component {...pageProps} />
			<ToastContainer />
		</>
	)
}

export default MyApp

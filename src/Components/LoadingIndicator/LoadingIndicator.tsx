import React from 'react';
import styles from './LoadingIndicator.module.css';

const LoadingIndicator = () => {
	return (
		<div className={styles.lds_ring}>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
};

export { LoadingIndicator };

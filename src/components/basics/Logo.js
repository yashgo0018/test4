import React from 'react'
import Logo from '../../images/logo.png'

export default function LogoFunction() {
	return <a href="/">
		<img
			width={300}
			src={Logo}
			className="header-logo" alt="Logo" />
	</a>
}
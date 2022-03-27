import React from 'react'
import Link from 'next/link' 

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign Ip', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
    currentUser && { label: 'Sell ticket', href: '/tickets/new' },
    currentUser && { label: 'My orders', href: '/orders' },
  ]
    .filter(el => el)
    .map(({label, href}) => (
      <li key={href} className='nav-item'>
        <Link href={href}>
          <a className='nav-link'>{ label }</a>
        </Link>
      </li>
    ))

  return (
    <nav className='navbar navbar-light bg-light'>
      <Link href='/'>
        <a className='navbar-brand'>GitTix</a>
      </Link>
      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>
          {links}
        </ul>
      </div>
    </nav>
  )
}

export default Header
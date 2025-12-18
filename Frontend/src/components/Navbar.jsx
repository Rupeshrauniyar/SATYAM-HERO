import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../contexts/AppContext' 
const Navbar = () => {
    const { user } = useContext(AppContext)
  return (
      <div className='bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50'>
          <div className='container mx-auto flex justify-between items-center'>
              <Link to='/' className='text-white text-2xl font-bold'>MTA</Link>
              <span>Hi, {user?.name}</span>
          </div>
    </div>
  )
}

export default Navbar
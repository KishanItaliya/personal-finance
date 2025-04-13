import { User } from '@prisma/client'
import React from 'react'

const Header = ({ user }: { user: User }) => {
  return (
    <div>
      <h1>Header</h1>
      <p>{user.email}</p>
    </div>
  )
}

export default Header

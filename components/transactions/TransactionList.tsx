import { Transaction } from '@prisma/client'
import React from 'react'

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <div>
      <h1>Transaction List</h1>
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          <h2>{transaction?.createdAt.toLocaleDateString()}</h2>
        </div>
      ))}
    </div>
  )
}

export default TransactionList

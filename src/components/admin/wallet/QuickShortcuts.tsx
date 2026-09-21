"use client"
import Button from '@/components/ui/button/Button'
import { Modal } from '@/components/ui/modal'
import TransferFund from '@/components/withdraw/TransferFund'
import { useAuth } from '@/context/AuthContext'
import { Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const QuickShortcuts = () => {

  const [transModal, setTransModal] = useState(false)

  const router = useRouter()

  const { user } = useAuth()

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full h-14" variant="outline" onClick={() => {
            router.push("/withdrawals")
          }}>Withdraw</Button>
          <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            onClick={() => {
              if (user && !user.transaction_pin_hash) {
                alert("Please create your transaction PIN first to secure your transfers.")
              }
              else {
                setTransModal(true)
              }
            }}
          >Transfer</Button>

          {/* <Button className="w-full h-14" variant="outline">View History</Button> */}
        </div>
      </div>


      <Modal isOpen={transModal} onClose={() => setTransModal(false)}
        className="max-w-4xl"
      >
        <div className="p-6 space-y-4 ">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Funds ( D to D)</h2>
              <p className="text-sm text-gray-500">Transfer fund to distributor</p>
            </div>
          </div>
          <TransferFund closeModal={() => setTransModal(false)} />
        </div>

      </Modal>


    </>
  )
}

export default QuickShortcuts

import React, { Suspense } from 'react'
import RegisterComponent from '../_components/register-component'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterComponent />
    </Suspense>
  )
}

export default Page

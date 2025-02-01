import { Outlet } from 'react-router-dom'

function ChatSection() {
  return (
    <div className='h-[100svh] w-full bg-blackv1'>
          <Outlet/>
    </div>
  )
}

export default ChatSection

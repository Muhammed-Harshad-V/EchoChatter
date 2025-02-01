import { Outlet } from 'react-router-dom'

function ChatSection() {
  return (
    <div className='h-full w-full bg-blackv1'>
          <Outlet/>
    </div>
  )
}

export default ChatSection

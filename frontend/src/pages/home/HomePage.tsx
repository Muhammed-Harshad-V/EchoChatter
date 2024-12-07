import ChatSection from "../../Components/home/ChatSection"
import Contacts from "../../Components/home/Contacts"
import Sidebar from "../../Components/home/Sidebar"


function HomePage() {
  return (
    <div className="h-screen flex bg-black">
     {/* Sidebar (right side) */}
      <Sidebar />

      {/* Contacts Section (left side) */}
      <Contacts />

      {/* Chat Section (middle) */}
      <ChatSection />

    </div>
  )
}

export default HomePage
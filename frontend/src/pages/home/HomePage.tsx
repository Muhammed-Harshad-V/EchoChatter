import ChatSection from "../../Components/home/ChatSection"
import Contact from "../../Components/home/Contact"



function HomePage() {
  return (
    <div className="h-screen flex bg-black">
     {/* Sidebar (right side) */}
      <Contact />

      {/* Chat Section (middle) */}
      <ChatSection />

    </div>
  )
}

export default HomePage
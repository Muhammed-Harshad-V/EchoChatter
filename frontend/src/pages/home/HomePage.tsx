import ChatSection from "../../Components/home/ChatSection"
import Contact from "../../Components/home/Contact"



function HomePage() {
  return (
    <div className="h-[calc(100svh-60px)] flex bg-black">
     {/* Sidebar (right side) */}
      <Contact />

      {/* Chat Section (middle) */}
      <ChatSection />

    </div>
  )
}

export default HomePage
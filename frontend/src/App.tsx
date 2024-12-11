import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./pages/navbar/Navbar";
import IndivitualChat from "./Components/home/IndivitualChat";
import LoginPage from "./pages/loginpage/LoginPage";





function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navbar/>,
      children: [
        {
        path: "/",
        element: <HomePage/>,
        children: [
          {
            path: "/contact/:chatId",
            element: <IndivitualChat/>
          },
        ]
      },
        {
        path: "/login",
        element: <LoginPage/>
      },
    ]
    }
    
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App

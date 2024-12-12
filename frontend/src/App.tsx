import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./pages/navbar/Navbar";
import IndivitualChat from "./Components/home/IndivitualChat";
import LoginPage from "./pages/loginpage/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ProfileCreationPage from "./pages/profile/profilecreation/profileCreationPage";




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
          {
            path: "/contact/group:chatId",
            element: <IndivitualChat/>
          },
        ]
      },
    ]
  },
    {
      path: "/login",
      element: <LoginPage/>
    },
      {
      path: "/signup",
      element: <RegisterPage/>
    },
      {
      path: "/create/Profile",
      element: <ProfileCreationPage/>
    },
    
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App

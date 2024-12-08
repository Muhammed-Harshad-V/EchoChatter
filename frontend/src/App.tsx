import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/loginpage/LoginPAge";
import Navbar from "./pages/navbar/Navbar";





function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navbar/>,
      children: [
        {
        path: "/",
        element: <HomePage/>
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

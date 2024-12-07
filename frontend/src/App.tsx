import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./pages/navbar/navbar";




function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navbar/>,
      children: [{
        path: "/",
        element: <HomePage/>
      },
    ]
    }
    
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App

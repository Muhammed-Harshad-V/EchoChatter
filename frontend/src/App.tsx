import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./pages/navbar/Navbar";
import IndivitualChat from "./Components/home/IndivitualChat";
import LoginPage from "./pages/loginpage/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ProfileCreationPage from "./pages/profile/profilecreation/profileCreationPage";
import NewPrivateChat from "./Components/home/newchats/private/NewPrivateChat";
import { ContactsProvider } from "./context/ContactsProvider.tsx";
import NewGroupChat from "./Components/home/newchats/groupchat/newGroupChat.tsx";
import ProtectedRoute from "./protection/ProtectedRoute.tsx";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute><Navbar/></ProtectedRoute>,  // Wrap Navbar and its child routes in ProtectedRoute
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
        {
          path: "/add/private",
          element: <NewPrivateChat/>
        },
        {
          path: "/create/group",
          element: <NewGroupChat/>
        },
      ]
    },
    {
      path: "/signup",
      element: <RegisterPage/>  // No need for ProtectedRoute, as it's for public access
    },
    {
      path: "/create/Profile",
      element: <ProfileCreationPage/>  // Assuming Profile creation is public before login
    },
    {
      path: "/login",
      element: <LoginPage/>  // No need for ProtectedRoute, as it's for public access
    },
  ]);

  return (
    <ContactsProvider>
      <RouterProvider router={router} />
    </ContactsProvider>
  );
}

export default App;

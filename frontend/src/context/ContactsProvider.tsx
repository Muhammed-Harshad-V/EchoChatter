import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";

// Define the types for the context value
interface GlobalStateContextType {
  contacts: any[];
  loading: boolean;
  fetchContacts: () => void;
}

// Create the context with a default value
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Custom hook to use the context
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a ContactsProvider");
  }
  return context;
}

// Define the props for the ContactsProvider component
type ContactsProviderProps = {
  children: ReactNode;
};

export const ContactsProvider = ({ children }: ContactsProviderProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    const Username = localStorage.getItem("username"); // Get username from localStorage

    if (!Username) {
      console.error("Username not found in localStorage");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/contacts/${Username}`
      );
      const { privateContacts, groupContacts } = response.data;

      const formattedContacts = [
        ...privateContacts.map((contact: any) => ({
          type: "private",
          data: {
            username: contact.username,
            firstname: contact.firstname,
            lastname: contact.lastname,
          },
        })),
        ...groupContacts.map((group: any) => ({
          type: "group",
          data: {
            name: group.groupname,
            participants: group.participants,
          },
        })),
      ];

      setContacts(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(); // Call the fetch function on component mount
  }, []);

  return (
    <GlobalStateContext.Provider value={{ contacts, loading, fetchContacts }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
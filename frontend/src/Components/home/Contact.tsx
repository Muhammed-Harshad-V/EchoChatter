import { NavLink } from 'react-router-dom';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Contact = () => {
  const contacts = [
    { id: 1, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 2, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 3, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 4, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 5, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 6, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 7, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 8, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 9, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 10, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 11, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 12, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 13, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 14, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 15, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 16, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 1, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 2, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 3, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 4, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 5, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 6, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 7, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 8, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 9, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 10, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 11, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 12, name: "Sara Connor", isOnline: false, photoUrl: "" },
    { id: 13, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 14, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 15, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 16, name: "Sara Connor", isOnline: false, photoUrl: "" },
  ];

  const defaultPhotoUrl =
    "https://www.w3schools.com/w3images/avatar2.png"; // Default profile photo

  return (
    <div className="w-[250px] bg-black p-4 flex flex-col justify-between max-h-screen">
        <div className='flex items-center ml-8 mb-6'>
           <FontAwesomeIcon
                icon={faComments}
                style={{ color: '#c9c9c9'}}
                size="2x"
            />
            <p className='text-white text-[25px] ml-4'>Chat</p>
           </div>
        <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent'>


        {/* Contacts List with Scrollbar */}
        <div className="space-y-2 ml-4 mr-4">
          {contacts.map((contact) => (
            <NavLink
              key={contact.id}
              to={`/contact/${contact.id}`} // Add the appropriate route
              className={({ isActive }) =>
                `block p-3 rounded-2xl text-gray-300 ${
                  isActive ? "bg-blackv1" : "" // Apply active styles
                }`
              }
            >
              {/* Avatar and Status */}
              <div className="flex items-center space-x-4 w-full">
                <div
                  className={`avatar ${contact.isOnline ? "online" : "offline"}`}
                >
                  <div className="relative w-12 h-12 rounded-full">
                    <img
                      src={contact.photoUrl || defaultPhotoUrl} // Use default if no photo
                      alt={contact.name}
                      className="object-cover w-full h-full rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full ${
                        contact.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                </div>
                <span>{contact.name}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;

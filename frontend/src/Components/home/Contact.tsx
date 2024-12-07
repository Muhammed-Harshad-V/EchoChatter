import { NavLink } from 'react-router-dom';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Contact = () => {
  const contacts = [
    { id: 1, name: "John Doe", isOnline: true, photoUrl: "" },
    { id: 2, name: "Jane Smith", isOnline: false, photoUrl: "" },
    { id: 3, name: "Mark Taylor", isOnline: true, photoUrl: "" },
    { id: 4, name: "Sara Connor", isOnline: false, photoUrl: "" },
    // (and the rest of your contacts...)
  ];

  const defaultPhotoUrl =
    "https://www.w3schools.com/w3images/avatar2.png"; // Default profile photo

  return (
    <div className="w-[60px] lg:w-[320px] bg-black lg:p-4 flex flex-col justify-between">
      <div className='flex items-center ml-2 mt-3 mb-3 lg:ml-8 lg:mt-6 lg:mb-3'>
        <FontAwesomeIcon
          icon={faComments}
          style={{ color: '#c9c9c9'}}
          size="2x"
        />
        <p className='text-white text-[25px] ml-4 lg:block sm:hidden sm-custom:hidden'>Chat</p>
      </div>

      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent'>
        {/* Contacts List with Scrollbar */}
        <div className="space-y-2 ml-0 mr-0 lg:ml-4 lg:mr-4">
          {contacts.map((contact) => (
            <NavLink
              key={contact.id}
              to={`/contact/${contact.id}`} // Add the appropriate route
              className={({ isActive }) =>
                `block p-3 lg:pl-2 rounded-2xl text-gray-300 ${
                  isActive ? "bg-blackv1" : "" // Apply active styles
                }`
              }
            >
              {/* Avatar and Status */}
              <div className="flex items-center lg:space-x-4 w-full">
                <div
                  className={`avatar ${contact.isOnline ? "online" : "offline"}`}
                >
                  <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full">
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
                <span className='lg:block sm:hidden sm-custom:hidden '>{contact.name}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;

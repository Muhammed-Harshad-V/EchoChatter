const Contacts = () => {
  const contacts = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mark Taylor" },
    { id: 4, name: "Sara Connor" },
  ];

  return (
    <div className="w-[200px] bg-blacks1 p-4 overflow-y-auto rounded-r-2xl">
      <h1 className="text-2xl font-bold mb-6 text-white">Contacts</h1>

      {/* Contacts List */}
      <ul className="space-y-4">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="p-3 rounded-md hover:bg-blackv1 text-gray-300 cursor-pointer"
          >
            {contact.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;

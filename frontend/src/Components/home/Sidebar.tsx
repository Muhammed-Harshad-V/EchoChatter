import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  return (
    <div className="w-[70px] bg-blackv1 p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-[30px] font-bold mb-8 text-white ml-2">H</h1>
        <div className="space-y-4">
           <button className='flex flex-col items-center ml-2 mb-6'>
           <FontAwesomeIcon
                icon={faComments}
                style={{ color: '#c9c9c9'}}
                size="lg"
            />
            <p className='text-white text-[15px]'>chat</p>
           </button>
           <button className='flex flex-col items-center'>
           <FontAwesomeIcon
                icon={faUser}
                style={{ color: '#c9c9c9'}}
                size="lg"
            />
            <p className='text-white text-[15px]'>friends</p>
           </button>
        </div>
      </div>
      <div>
      <button className='ml-2 mb-4'>
           <FontAwesomeIcon
                icon={faRightFromBracket}
                style={{ color: '#c9c9c9'}}
                size="lg"
            />
           </button>
      </div>
    </div>
  );
};

export default Sidebar;

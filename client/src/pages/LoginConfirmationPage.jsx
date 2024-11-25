import { useEffect, useState } from 'react';
import { useParams, Link,Navigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginConfirmationPage() {
    const { token } = useParams(); // Отримання токену з URL
    const [notification, setNotification] = useState('');
    const [redirect, setRedirect] = useState(false);
    const handleConfirm = async () => {
        setNotification('');
        try {
            await axios.get(`/verify/${token}`);
            setRedirect(true);
            
        } catch (err) {
            setNotification('Не вдалося підтвердити реєстрацію. Спробуйте ще раз.');
        }
    };
    if (redirect) {
        return <Navigate to={'/login'} />
      }
    return (
        <div className="mt-4 grow flex items-center justify-around bg-gray-200 border border-2 border-primary rounded-2xl">
            <div>
                <div className="text-2xl text-center mb-4 font-bold font-helvetica">
                    Чи дійсно ви бажаєте підтвердити реєстрацію <br />
                     в застосунку My City?
                </div>
                <button className="primary" onClick={handleConfirm}>
                    Підтвердити
                </button>
                {notification && <div className="text-center mt-2">{notification}</div>}
                <div className="text-center py-2 text-gray-500">
                    Вже зареєстровані? <Link className="underline text-black" to={'/login'}>Увійти</Link>
                </div>
            </div>
        </div>
    );
}

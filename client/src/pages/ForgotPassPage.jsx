import {Link,Navigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [redirect, setRedirect] = useState(false);
    async function handleForgotPassword(ev) {
        ev.preventDefault();
        try {
            await axios.post('/forgotpass', { email, });
            alert('Інструкції для відновлення паролю надіслано на вашу електронну адресу!');
            setRedirect(true);
        } catch (e) {
            alert('На жаль, не вдалося відправити інструкції. Спробуйте ще раз.');
        }
    }
    if (redirect) {
        return <Navigate to={'/login'} />
    }
    return (
        <div className="mt-4 grow flex items-center justify-around bg-gray-200 border border-2 border-primary rounded-2xl">
            <div >
            <div className="text-2xl text-center mb-4 font-bold font-helvetica">
            Відновлення доступу
            </div>
                <form className="max-w-md mx-auto" onSubmit={handleForgotPassword}>
                    <input type="email"
                        placeholder="Електронна адреса: your@email.com"
                        value={email}
                        onChange={ev => setEmail(ev.target.value)} 
                        required
                    />
                    <button className="primary">Відновити пароль</button>
                    <div className="text-center py-2 text-gray-500">
                        Пам'ятаєте пароль? <Link className="underline text-black" to={'/login'}>Увійти</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useParams, Link,Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
    const { token } = useParams(); // Отримання токену з URL
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [redirect, setRedirect] = useState(false);

    function validatePassword(password) {
        const minLength = /.{8,}/;
        const hasUppercase = /[A-Z]/;
        const hasDigit = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (!minLength.test(password)) {
            return 'Пароль повинен містити щонайменше 8 символів';
        }
        if (!hasUppercase.test(password)) {
            return 'Пароль повинен містити принаймні одну велику літеру';
        }
        if (!hasDigit.test(password)) {
            return 'Пароль повинен містити принаймні одну цифру';
        }
        if (!hasSpecialChar.test(password)) {
            return 'Пароль повинен містити принаймні один спеціальний символ';
        }
        return null;
    }

    async function handleResetPassword(ev) {
        ev.preventDefault();
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Паролі не співпадають');
            return;
        }

        try {
            await axios.post('/resetpassword', { token, newPassword });
            setError('');
            setRedirect(true);
        } catch (e) {
            setError('Не вдалося змінити пароль. Спробуйте ще раз.');
        }
    }
    if (redirect) {
        return <Navigate to={'/login'} />
      }
    return (
        <div className="mt-4 grow flex items-center justify-around bg-gray-200 border border-2 border-primary rounded-2xl">
            <div>
                <div className="text-2xl text-center mb-4 font-bold font-helvetica">Зміна пароля</div>
                <form className="max-w-md mx-auto" onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="Введіть новий пароль"
                        value={newPassword}
                        onChange={ev => setNewPassword(ev.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Підтвердіть новий пароль"
                        value={confirmNewPassword}
                        onChange={ev => setConfirmNewPassword(ev.target.value)}
                        required
                    />
                    <button className="primary">Змінити пароль</button>
                    {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                    <div className="text-center py-2 text-gray-500">
                        Пам'ятаєте пароль? <Link className="underline text-black" to={'/login'}>Увійти</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

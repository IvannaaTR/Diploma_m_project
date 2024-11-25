import {Link,Navigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";
export default function RegisterPage(){
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
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
    async function registerUser(ev) {
        ev.preventDefault();
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return; 
        } else {
            setError(''); 
        }
        try {
            await axios.post('/register', {
              name,
              email,
              password,
            });
            alert('Підтвердження для реєстрації надіслано на вашу електронну адресу!');
            setRedirect(true);
          } catch (error) {
            alert(`Увага! На жаль не вдалося зареєструватися, спробуйте ще раз :( ${error.response.data.error}`);
          }
      }
      if (redirect) {
        return <Navigate to={'/login'} />
      }
    return (
        <div className="mt-4 grow flex items-center justify-around bg-gray-200 border border-2 border-primary rounded-2xl">
            <div>
                <h1 className="text-2xl text-center mb-4 font-bold font-helvetica">Реєстрація</h1>
                <form className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input type="text"
                    placeholder="Прізвище та ім'я"
                    value={name}
                    onChange={ev => setName(ev.target.value)}
                    required 
                    />
                    <input type="email"
                            placeholder="Електронна адреса: your@email.com"
                            value={email}
                            onChange={ev => setEmail(ev.target.value)} 
                            required
                            />
                    <input type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={ev => setPassword(ev.target.value)} 
                            required
                            />
                     {error && <div className="text-red-500 text-center">{error}</div>} 
                    <button className="primary">Зареєструватися</button>
                    <div className="text-center py-2 text-gray-500">
                        Вже зареєстровані? <Link className="underline text-black" to={'/login'}>Увійти</Link>
                    </div>
                </form>
            </div>
        </div> 
    );
}
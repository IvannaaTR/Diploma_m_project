import {Link, Navigate} from "react-router-dom";
import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "../UserContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const {setUser} = useContext(UserContext);
  async function handleLogin(ev) {
    ev.preventDefault();
    try {
      const {data} = await axios.post('/login', {email,password});
      setUser(data);
      alert('Вхід успішно виконано!');
      setRedirect(true);
    } catch (error) {
      alert(`Увага! Не вдалося увійти, спробуйте ще раз :(  ${error.response.data.error}`);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <div className="mt-4 grow flex items-center justify-around bg-gray-200 border border-2 border-primary rounded-2xl">
      <div >
        <h1 className="text-2xl text-center mb-4 font-bold font-helvetica">Вхід</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLogin}>
          <input type="email"
                 placeholder="Введіть електронну адресу: your@email.com"
                 value={email}
                 onChange={ev => setEmail(ev.target.value)}
                 required
                  />
                
          <input type="password"
                 placeholder="Введіть пароль:"
                 value={password}
                 onChange={ev => setPassword(ev.target.value)}
                 required
                />
          <button className="primary">Увійти</button>
          <div className="text-center py-2 text-gray-500">
          Немає аккаунта? <Link className="underline text-blue-500" to={'/register'}>Зареєструйтесь</Link>   
          </div>
          <div className="text-center text-gray-500">
            <Link className="underline text-blue-500" to={'/forgotpass'}>Забули пароль?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
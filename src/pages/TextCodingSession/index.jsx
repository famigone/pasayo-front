import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { TextEditor } from '../../components';
import { createSession, getExperiencia, joinSession } from './handlers';
import { URL_BACK } from '../../utils/config';
import { getSession } from '../../utils/auth';

let socket;

const TextCodingSession = () => {
  let { id, user: paramUser, room } = useParams();
  const { username: user } = getSession();
  const [session, setSession] = useState({
    data: null,
    loading: false,
    error: null,
    users: [],
  });

  const [experiencia, setExperiencia] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const [code, setCode] = useState({
    body: '',
    compiled: false,
    error: null,
    sending: false,
  });

  const disconnectFromSession = () => {
    socket.disconnect();
  };

  useEffect(() => {
    socket = io(URL_BACK);

    if (paramUser === user) {
      createSession(session, setSession, id, paramUser);
    }
  }, []);

  useEffect(() => {
    socket = io(URL_BACK);

    socket.emit('user_join_room', { room, user }, (error) => {
      if (error) {
        toast.error(error);
      }
    });
  }, [URL_BACK, room]);

  useEffect(() => {
    socket.on('user_joined_room', (payload) => {
      setSession({ ...session, users: [...session.users, payload] });
    });
  }, []);

  useEffect(() => {
    if (session.data) {
      getExperiencia(experiencia, setExperiencia, code, setCode, id);
    }
  }, [session.data]);

  return (
    <>
      <div className='container'>
        <Link className='btn btn-warning my-2' to={'/'} onClick={() => disconnectFromSession}>
          <i className='fas fa-arrow-left' /> Volver al Inicio
        </Link>
      </div>

      {session.loading && !session.data && (
        <div className='spinner-grow text-warning' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      )}

      {experiencia.loading && !experiencia.data && (
        <div className='spinner-grow text-warning' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      )}

      {!experiencia.loading && experiencia.data && (
        <div className='container mt-2'>
          <div className='card mb-2'>
            <div className='card-header'>
              <span className='fw-bold'>{experiencia?.data?.titulo?.toUpperCase()}</span>
            </div>
            <ul className='list-group list-group-flush'>
              <li className='list-group-item fst-italic d-flex gap-2'>
                <i className='bi bi-chat-fill' /> <span>{experiencia?.data?.narrativa}</span>
              </li>
              <li className='list-group-item fw-bold d-flex gap-2'>
                <i className='bi bi-bullseye' />
                <span>{experiencia?.data?.objetivo}</span>
              </li>
              <li className='list-group-item'>
                <span className='badge text-bg-secondary'>{experiencia?.data?.tema}</span>
              </li>
            </ul>
          </div>

          <TextEditor isSession code={code} setCode={setCode} />

          <h5 className='mt-3'>Usuarios Conectados</h5>
          <div className='d-flex gap-2 justify-content-start'>
            {session.users &&
              session.users.map((user, i) => (
                <span key={i} className='badge bg-dark fs-6 d-flex gap-2'>
                  <i className='bi bi-person-fill' />
                  <span>{user}</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TextCodingSession;

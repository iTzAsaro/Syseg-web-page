import axios from '../api/axios';

const API_URL = '/usuarios';

const getAll = (params) => {
    return axios.get(API_URL, { params });
};

const get = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const create = (data) => {
    return axios.post(API_URL, data);
};

const update = (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
};

const remove = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

const changeStatus = (id, estado) => {
    return axios.put(`${API_URL}/${id}/estado`, { estado });
};

const updatePermissions = (id, permisos) => {
    return axios.put(`${API_URL}/${id}/permisos`, { permisos });
};

const getRoles = () => {
    return axios.get('/roles');
};

const getPermissions = () => {
    return axios.get('/permisos');
};

const UsuarioService = {
    getAll,
    get,
    create,
    update,
    remove,
    changeStatus,
    updatePermissions,
    getRoles,
    getPermissions
};

export default UsuarioService;

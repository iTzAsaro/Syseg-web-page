import axios from '../api/axios';

const getAll = async () => {
    const response = await axios.get('/regiones');
    return response.data;
};

const regionService = {
    getAll
};

export default regionService;

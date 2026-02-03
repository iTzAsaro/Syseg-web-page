import axios from '../api/axios';

const getAll = async (regionId = null) => {
    let url = '/comunas';
    if (regionId) {
        url += `?region_id=${regionId}`;
    }
    const response = await axios.get(url);
    return response.data;
};

const comunaService = {
    getAll
};

export default comunaService;

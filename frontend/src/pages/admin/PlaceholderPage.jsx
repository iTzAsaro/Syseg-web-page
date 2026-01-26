import React from 'react';
import { Settings } from 'lucide-react';
import Layout from '../../components/Layout';

const PlaceholderPage = ({ title }) => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-600">{title}</h3>
                <p className="text-sm">Sección en Construcción</p>
            </div>
        </Layout>
    );
};

export default PlaceholderPage;
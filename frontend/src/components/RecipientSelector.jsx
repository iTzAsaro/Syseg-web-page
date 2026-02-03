import React, { useState, useEffect } from 'react';
import { User, Plus, MapPin, Briefcase } from 'lucide-react';
import guardiaService from '../services/guardiaService';

const RecipientSelector = ({ item, onUpdate }) => {
  const [mode, setMode] = useState('select'); // 'select' | 'new'
  const [selectedId, setSelectedId] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nuevo destinatario
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    relation: '',
    address: ''
  });

  // Cargar guardias desde la base de datos
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const data = await guardiaService.getAll();
        setRecipients(data);
      } catch (error) {
        console.error("Error cargando destinatarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipients();
  }, []);

  // Inicializar selección basada en el item
  useEffect(() => {
    if (item.recipient) {
      if (item.recipient.id) {
        setSelectedId(item.recipient.id);
        setMode('select');
      } else {
        setMode('new');
        setNewRecipient(item.recipient);
      }
    }
  }, [item.recipient]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setMode('new');
      onUpdate({ ...newRecipient, id: null }); // Limpiar ID para indicar nuevo
    } else {
      setMode('select');
      setSelectedId(val);
      const recipient = recipients.find(r => r.id === parseInt(val) || r.id === val);
      if (recipient) {
        // Adaptar estructura si es necesario
        onUpdate({
            id: recipient.id,
            name: recipient.nombre,
            type: 'Guardia', // Asumimos rol guardia
            relation: recipient.rut
        });
      }
    }
  };

  const handleNewChange = (field, value) => {
    const updated = { ...newRecipient, [field]: value, id: null };
    setNewRecipient(updated);
    onUpdate(updated);
  };

  return (
    <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
      <div className="flex items-center gap-2 mb-2 text-gray-600 font-semibold text-xs uppercase tracking-wide">
        <User className="w-3 h-3" />
        <span>Destinatario</span>
      </div>

      <select
        className="w-full p-2 rounded-md border border-gray-200 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none"
        value={mode === 'new' ? 'new' : selectedId}
        onChange={handleSelectChange}
        disabled={loading}
      >
        <option value="" disabled>Seleccionar...</option>
        {recipients.map(r => (
          <option key={r.id} value={r.id}>{r.nombre} - {r.rut}</option>
        ))}
        <option value="new">+ Nuevo Destinatario</option>
      </select>

      {mode === 'new' && (
        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-2 rounded-md border border-gray-200 text-sm focus:border-black outline-none"
            value={newRecipient.name}
            onChange={(e) => handleNewChange('name', e.target.value)}
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Briefcase className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cargo/Relación"
                className="w-full pl-8 p-2 rounded-md border border-gray-200 text-sm focus:border-black outline-none"
                value={newRecipient.relation}
                onChange={(e) => handleNewChange('relation', e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Dirección/Ubicación"
                className="w-full pl-8 p-2 rounded-md border border-gray-200 text-sm focus:border-black outline-none"
                value={newRecipient.address}
                onChange={(e) => handleNewChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;

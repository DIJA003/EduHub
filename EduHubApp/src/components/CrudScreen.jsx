/**
 * components/CrudScreen.jsx
 * Generic list view for admin CRUD pages
 */
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen, Card, ErrorBox, EmptyState, C, st } from './UI';

function safeArray(d) { return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; }

export default function CrudScreen({ title, loadFn, columns }) {
  const [rows,  setRows]  = useState([]);
  const [error, setError] = useState('');

  const fields = columns.filter(c => !['id', '_id', 'createdAt', 'updatedAt'].includes(c));

  useEffect(() => {
    loadFn()
      .then(d => setRows(safeArray(d)))
      .catch(e => setError(e.message));
  }, []);

  return (
    <Screen>
      <Text style={st.pageTitle}>{title}</Text>
      <ErrorBox message={error} />
      {rows.length === 0 ? (
        <EmptyState icon="📋" title="No records yet" />
      ) : (
        rows.slice(0, 50).map((row, i) => (
          <Card key={row._id || i}>
            {fields.slice(0, 4).map(f => (
              <View key={f} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>{f}</Text>
                <Text style={{ fontSize: 12, color: C.text, fontWeight: '500', flexShrink: 1, textAlign: 'right', maxWidth: '60%' }}>
                  {String(row[f] ?? '—')}
                </Text>
              </View>
            ))}
          </Card>
        ))
      )}
    </Screen>
  );
}
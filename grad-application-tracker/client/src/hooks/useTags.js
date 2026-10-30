import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/tags');
      setTags(data.tags);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTag = useCallback(async (name) => {
    const data = await api.post('/tags', { name });
    setTags((prev) => [...prev, data.tag].sort((a, b) => a.name.localeCompare(b.name)));
    return data.tag;
  }, []);

  const deleteTag = useCallback(async (id) => {
    await api.delete(`/tags/${id}`);
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  }, []);

  return { tags, loading, createTag, deleteTag, reload: load };
}

export default useTags;

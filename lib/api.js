// lib/api.js
export const graphqlRequest = async (query, variables = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Detect if any variable is a File or contains Files
  const hasFiles = Object.values(variables).some(
    (val) => val instanceof File || (Array.isArray(val) && val.some(v => v instanceof File))
  );

  let body;
  let headers = {
    'Authorization': token ? `Bearer ${token}` : '',
  };

  if (hasFiles) {
    // === MULTIPART REQUEST FOR FILE UPLOADS ===
    const formData = new FormData();
    
    // Clone variables and prepare for mapping
    const clonedVariables = JSON.parse(JSON.stringify(variables, (key, value) => {
      // Replace File objects with null in the operations JSON
      if (value instanceof File) return null;
      if (Array.isArray(value) && value.some(v => v instanceof File)) {
        return value.map(v => (v instanceof File ? null : v));
      }
      return value;
    }));

    const operations = {
      query,
      variables: clonedVariables
    };

    // Build the map object and collect files
    const map = {};
    const filesToAppend = []; // Collect files to append AFTER map
    let fileIndex = 0;

    // Process each variable - build map and collect files
    Object.entries(variables).forEach(([key, value]) => {
      if (value instanceof File) {
        // Single file
        map[fileIndex] = [`variables.${key}`];
        filesToAppend.push({ index: fileIndex, file: value });
        fileIndex++;
      } else if (Array.isArray(value) && value.some(v => v instanceof File)) {
        // Array of files
        value.forEach((file, i) => {
          if (file instanceof File) {
            map[fileIndex] = [`variables.${key}.${i}`];
            filesToAppend.push({ index: fileIndex, file: file });
            fileIndex++;
          }
        });
      }
    });

    // CORRECT ORDER: operations → map → files
    formData.append('operations', JSON.stringify(operations));
    formData.append('map', JSON.stringify(map));
    
    // Now append all files AFTER map
    filesToAppend.forEach(({ index, file }) => {
      formData.append(index.toString(), file);
    });

    body = formData;
    // IMPORTANT: Do NOT set Content-Type header - browser will set it with boundary
  } else {
    // === STANDARD JSON REQUEST ===
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ query, variables });
  }

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers,
      body,
    });

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Server returned HTML or other non-JSON response
      const text = await response.text();
      console.error('Server returned non-JSON response:', text.substring(0, 200));
      throw new Error('Server error: Expected JSON response but got HTML. Check server logs.');
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request Error:', error);
    throw error;
  }
};
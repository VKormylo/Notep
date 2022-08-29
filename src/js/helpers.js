export const getURL = () => location.hash.slice(1);
export const setDefaultURL = () => (location.hash = "#notes");
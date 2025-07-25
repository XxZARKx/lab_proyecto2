// import api from "./api";

export const createTicket = async (ticketData) => {
  // En una aplicación real, esto llamaría a tu backend Java
  // Por ahora simulamos la respuesta
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        ...ticketData,
        status: "Pendiente",
        createdAt: new Date().toISOString(),
      });
    }, 1000);
  });
};

export const getCategories = async () => {
  // Simulamos categorías desde el backend
  return Promise.resolve([
    { id: 1, name: "Hardware" },
    { id: 2, name: "Software" },
    { id: 3, name: "Redes" },
    { id: 4, name: "Correo electrónico" },
    { id: 5, name: "Accesos" },
  ]);
};

export const getTickets = async (userId, filters = {}) => {
  // Simulamos una llamada API con datos de prueba
  const mockTickets = [
    {
      id: "TKT-1001",
      title: "Problema con el correo electrónico",
      description: "No puedo acceder a mi cuenta desde ayer",
      status: "Pendiente",
      priority: "Alta",
      category: "Correo electrónico",
      createdAt: "2023-05-15T09:30:00",
      updatedAt: "2023-05-15T09:30:00",
    },
    // ... más tickets de ejemplo
  ];

  // Filtrado simulado
  let filteredTickets = mockTickets.filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.category && ticket.category !== filters.category) return false;
    return true;
  });

  return Promise.resolve({
    data: filteredTickets,
    total: filteredTickets.length,
    page: 1,
    pageSize: 10,
  });
};
